use axum::{
    extract::State,
    http::Method,
    routing::{get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::{net::SocketAddr, sync::Arc};
use tokio::{
    fs::{self, OpenOptions},
    io::AsyncWriteExt,
    sync::Mutex,
};
use tower_http::cors::{Any, CorsLayer};

#[derive(Clone)]
struct AppState {
    leads: Arc<Mutex<Vec<LeadRequest>>>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
struct LeadRequest {
    name: String,
    email: String,
    interest: String,
    note: String,
}

#[derive(Debug, Deserialize)]
struct ChatRequest {
    message: String,
}

#[derive(Debug, Serialize)]
struct ChatResponse {
    reply: String,
}

#[derive(Debug, Serialize)]
struct LeadResponse {
    success: bool,
    message: String,
}

#[derive(Debug, Clone)]
struct Product {
    name: &'static str,
    category: &'static str,
    price: u32,
    description: &'static str,
}

#[tokio::main]
async fn main() {
    let _ = fs::create_dir_all("output").await;

    let state = AppState {
        leads: Arc::new(Mutex::new(Vec::new())),
    };

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS])
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(health))
        .route("/chat", post(chat))
        .route("/leads", post(leads).get(list_leads))
        .with_state(state)
        .layer(cors);

    let addr = SocketAddr::from(([127, 0, 0, 1], 3001));
    println!("Listening on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn health() -> Json<serde_json::Value> {
    Json(json!({
        "ok": true,
        "message": "VoltIQ backend is running"
    }))
}

fn product_catalog() -> Vec<Product> {
    vec![
        Product {
            name: "Sony WH-1000XM5",
            category: "headphones",
            price: 299,
            description: "Excellent noise cancellation and comfort.",
        },
        Product {
            name: "Bose QuietComfort Headphones",
            category: "headphones",
            price: 279,
            description: "Strong ANC and a very comfortable fit.",
        },
        Product {
            name: "Anker Soundcore Space One",
            category: "headphones",
            price: 99,
            description: "Great value, good ANC, strong battery life.",
        },
        Product {
            name: "MacBook Air M3",
            category: "laptops",
            price: 1099,
            description: "Lightweight, fast, and great battery life.",
        },
        Product {
            name: "Dell XPS 13",
            category: "laptops",
            price: 1299,
            description: "Premium Windows laptop with a sharp display.",
        },
        Product {
            name: "ASUS Zenbook 14",
            category: "laptops",
            price: 899,
            description: "Strong balance of performance and portability.",
        },
    ]
}

async fn chat(
    State(_state): State<AppState>,
    Json(payload): Json<ChatRequest>,
) -> Json<ChatResponse> {
    let message = payload.message.to_lowercase();
    let catalog = product_catalog();

    let category = if message.contains("headphone") || message.contains("earbud") {
        "headphones"
    } else if message.contains("laptop") || message.contains("macbook") || message.contains("xps") {
        "laptops"
    } else {
        ""
    };

    let mut budget: Option<u32> = None;
    for token in message.split_whitespace() {
        let cleaned = token.trim_matches(|c: char| !c.is_ascii_digit());
        if let Ok(value) = cleaned.parse::<u32>() {
            if value >= 50 {
                budget = Some(value);
                break;
            }
        }
    }

    let mut matches: Vec<&Product> = catalog
        .iter()
        .filter(|p| category.is_empty() || p.category == category)
        .filter(|p| budget.map(|b| p.price <= b).unwrap_or(true))
        .collect();

    matches.sort_by_key(|p| p.price);

    let reply = if matches.is_empty() {
        if category == "headphones" {
            "I couldn’t find a strong match under that budget right now, but for headphones I’d prioritize noise cancellation, comfort, and battery life.".to_string()
        } else if category == "laptops" {
            "I couldn’t find a strong match under that budget right now, but for laptops I’d prioritize CPU, RAM, storage, and battery life.".to_string()
        } else {
            "Tell me the product type and budget, and I’ll recommend a few specific options.".to_string()
        }
    } else {
        let picks = matches
            .iter()
            .take(3)
            .map(|p| format!("{} (${}): {}", p.name, p.price, p.description))
            .collect::<Vec<_>>()
            .join("\n");

        if category == "headphones" {
            format!(
                "Here are a few headphone options I’d suggest:\n{}\n\nIf comfort is your top priority, I’d start with the Bose QuietComfort Headphones. If value matters most, the Anker Soundcore Space One is a strong pick.",
                picks
            )
        } else if category == "laptops" {
            format!(
                "Here are a few laptop options I’d suggest:\n{}\n\nIf portability matters most, I’d start with the MacBook Air M3. If you want a premium Windows option, the Dell XPS 13 is a strong pick.",
                picks
            )
        } else {
            format!(
                "Here are a few options I’d suggest:\n{}\n\nTell me which category matters most and I can narrow it down further.",
                picks
            )
        }
    };

    Json(ChatResponse { reply })
}

async fn leads(
    State(state): State<AppState>,
    Json(payload): Json<LeadRequest>,
) -> Json<LeadResponse> {
    println!("NEW LEAD: {:?}", payload);

    {
        let mut leads = state.leads.lock().await;
        leads.push(payload.clone());
    }

    let line = serde_json::to_string(&payload).unwrap() + "\n";
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open("output/leads.jsonl")
        .await
        .unwrap();

    file.write_all(line.as_bytes()).await.unwrap();
    file.flush().await.unwrap();

    Json(LeadResponse {
        success: true,
        message: "Lead received".to_string(),
    })
}

async fn list_leads() -> Json<serde_json::Value> {
    let content = fs::read_to_string("output/leads.jsonl")
        .await
        .unwrap_or_default();

    let leads: Vec<LeadRequest> = content
        .lines()
        .filter_map(|line| serde_json::from_str::<LeadRequest>(line).ok())
        .collect();

    Json(json!({
        "leads": leads
    }))
}