use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::path::PathBuf;
use tauri::{AppHandle, Emitter};
use tokio::process::Command;

// ── Types ────────────────────────────────────────────────────────────────────

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BuddyInfo {
    pub name: String,
    pub species: String,
}

#[derive(Serialize, Clone)]
pub struct StreamChunk {
    pub event_type: String, // "delta" | "done" | "error"
    pub text: String,
}

// ── Helpers ──────────────────────────────────────────────────────────────────

fn home_dir() -> Result<PathBuf, String> {
    std::env::var("HOME")
        .map(PathBuf::from)
        .map_err(|_| "HOME environment variable not set".to_string())
}

/// Build a PATH that includes all common locations for claude + Node.js.
fn enhanced_path() -> String {
    let current = std::env::var("PATH").unwrap_or_default();
    format!(
        "/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin:/usr/local/share/nvm/current/bin\
         :/usr/local/share/nvm/versions/node/$(node -v 2>/dev/null | tr -d v)/bin\
         :/Users/{}/.nvm/versions/node/current/bin:{}",
        std::env::var("USER").unwrap_or_default(),
        current
    )
}

/// Find the claude CLI binary — checks common macOS paths before falling back to PATH.
fn claude_bin() -> String {
    let candidates = [
        "/usr/local/bin/claude",
        "/opt/homebrew/bin/claude",
        "/usr/bin/claude",
        "/home/linuxbrew/.linuxbrew/bin/claude",
    ];
    for path in &candidates {
        if std::path::Path::new(path).exists() {
            return path.to_string();
        }
    }
    "claude".to_string()
}

/// Scan text for buddy name + species patterns.
fn parse_buddy_from_text(text: &str) -> Option<BuddyInfo> {
    let known_species = [
        "mushroom", "dragon", "cat", "fox", "dog", "rabbit", "bear", "wolf",
        "owl", "frog", "octopus", "penguin",
    ];

    for line in text.lines() {
        let line_lower = line.to_lowercase();

        for species in &known_species {
            if !line_lower.contains(species) {
                continue;
            }

            if let Some(pos) = line_lower.find(" is a ") {
                let name_part = line[..pos].trim();
                if let Some(name) = name_part.split_whitespace().last() {
                    let name = name.trim_matches(|c: char| !c.is_alphanumeric());
                    if name.len() > 1 && !matches!(name.to_lowercase().as_str(), "it" | "my" | "the" | "your") {
                        return Some(BuddyInfo { name: name.to_string(), species: species.to_string() });
                    }
                }
            }

            if let Some(pos) = line_lower.find("named ") {
                let after = &line[pos + 6..];
                if let Some(name) = after.split_whitespace().next() {
                    let name = name.trim_matches(|c: char| !c.is_alphanumeric());
                    if name.len() > 1 {
                        return Some(BuddyInfo { name: name.to_string(), species: species.to_string() });
                    }
                }
            }

            return Some(BuddyInfo { name: "Buddy".to_string(), species: species.to_string() });
        }
    }
    None
}

// ── Tauri Commands ───────────────────────────────────────────────────────────

#[tauri::command]
async fn check_claude_cli() -> Result<bool, String> {
    let result = Command::new(claude_bin())
        .arg("--version")
        .env("PATH", enhanced_path())
        .stdin(std::process::Stdio::null())
        .output()
        .await;

    match result {
        Ok(output) => Ok(output.status.success()),
        Err(_) => Ok(false),
    }
}

#[tauri::command]
async fn read_buddy_info() -> Result<BuddyInfo, String> {
    let home = home_dir()?;

    // 1. Ask the claude CLI — authoritative
    let cli_result = Command::new(claude_bin())
        .args([
            "-p",
            "What is my buddy character's name and species? Reply in exactly this format and nothing else: 'NAME is a SPECIES' — for example: 'Biscuit is a mushroom'",
            "--output-format", "text",
        ])
        .env("PATH", enhanced_path())
        .stdin(std::process::Stdio::null())
        .output()
        .await;

    if let Ok(output) = cli_result {
        let response = String::from_utf8_lossy(&output.stdout).to_string();
        if let Some(info) = parse_buddy_from_text(&response) {
            return Ok(info);
        }
    }

    // 2. User's global MEMORY.md
    let memory_path = home.join(".claude/MEMORY.md");
    if let Ok(content) = std::fs::read_to_string(&memory_path) {
        if let Some(info) = parse_buddy_from_text(&content) {
            return Ok(info);
        }
    }

    // 3. User's global CLAUDE.md
    let claude_md = home.join(".claude/CLAUDE.md");
    if let Ok(content) = std::fs::read_to_string(&claude_md) {
        if let Some(info) = parse_buddy_from_text(&content) {
            return Ok(info);
        }
    }

    Err("Could not determine buddy character. Please set up your Claude Code buddy.".to_string())
}

#[tauri::command]
fn read_buddy_state() -> Result<String, String> {
    let home = home_dir()?;
    let state_path = home.join(".buddy/state.json");

    if !state_path.exists() {
        return Ok(r#"{"xp":0,"stage":"baby","hunger":100,"happiness":100,"energy":100,"commits":0,"feedingStreak":0,"lastSaved":null}"#.to_string());
    }

    std::fs::read_to_string(&state_path).map_err(|e| e.to_string())
}

#[tauri::command]
fn write_buddy_state(state: String) -> Result<(), String> {
    let home = home_dir()?;
    let buddy_dir = home.join(".buddy");
    std::fs::create_dir_all(&buddy_dir).map_err(|e| e.to_string())?;
    std::fs::write(buddy_dir.join("state.json"), state).map_err(|e| e.to_string())
}

/// Send a message via the claude CLI. Uses --output-format text for reliability,
/// streams lines as they arrive so the UI shows a "typing" effect.
#[tauri::command]
async fn send_message(message: String, app: AppHandle) -> Result<(), String> {
    use tokio::io::{AsyncBufReadExt, BufReader};

    let mut child = Command::new(claude_bin())
        .args(["-p", &message, "--output-format", "text"])
        .env("PATH", enhanced_path())
        .stdin(std::process::Stdio::null())
        .stdout(std::process::Stdio::piped())
        .stderr(std::process::Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to spawn claude: {}", e))?;

    let stdout = child.stdout.take().ok_or("no stdout from claude")?;
    let stderr = child.stderr.take();
    let mut lines = BufReader::new(stdout).lines();
    let mut full_text = String::new();

    // Emit lines as they arrive — gives a streaming feel even with text format
    while let Ok(Some(line)) = lines.next_line().await {
        if !full_text.is_empty() {
            full_text.push('\n');
        }
        full_text.push_str(&line);
        let _ = app.emit("stream-chunk", StreamChunk {
            event_type: "delta".to_string(),
            text: full_text.clone(),
        });
    }

    let _ = child.wait().await;

    // If nothing came from stdout, read stderr for the error message
    if full_text.trim().is_empty() {
        let error_text = if let Some(err_pipe) = stderr {
            let mut err_lines = BufReader::new(err_pipe).lines();
            let mut buf = String::new();
            while let Ok(Some(line)) = err_lines.next_line().await {
                buf.push_str(&line);
                buf.push('\n');
                if buf.len() > 400 {
                    break;
                }
            }
            let trimmed = buf.trim().to_string();
            if trimmed.is_empty() {
                "No response from Claude. Make sure you're logged in: run `claude` in terminal.".to_string()
            } else {
                format!("Claude error: {}", &trimmed[..trimmed.len().min(300)])
            }
        } else {
            "No response. Run `claude` in your terminal to check authentication.".to_string()
        };

        let _ = app.emit("stream-chunk", StreamChunk {
            event_type: "error".to_string(),
            text: error_text,
        });
    }

    let _ = app.emit("stream-chunk", StreamChunk {
        event_type: "done".to_string(),
        text: String::new(),
    });

    Ok(())
}

/// Read MCP server configs — checks multiple locations Claude Code uses.
#[tauri::command]
fn read_mcp_servers() -> Result<Value, String> {
    let home = home_dir()?;

    // Locations to check, in priority order
    let candidates = [
        home.join(".claude/mcp-configs/mcp-servers.json"),
        home.join(".claude/settings.json"),
        home.join(".claude/settings.local.json"),
        home.join("Library/Application Support/Claude/claude_desktop_config.json"),
    ];

    for path in &candidates {
        if let Ok(content) = std::fs::read_to_string(path) {
            if let Ok(json) = serde_json::from_str::<Value>(&content) {
                // Key may be "mcpServers" at root or nested
                if let Some(mcp) = json.get("mcpServers").cloned() {
                    if mcp.as_object().map(|m| !m.is_empty()).unwrap_or(false) {
                        return Ok(mcp);
                    }
                }
            }
        }
    }
    Ok(Value::Object(Default::default()))
}

/// Toggle (enable/disable) an MCP server by adding/removing "disabled" in settings.json
#[tauri::command]
fn toggle_mcp_server(server_name: String, disabled: bool) -> Result<(), String> {
    let home = home_dir()?;
    let settings_path = home.join(".claude/settings.json");

    let content = std::fs::read_to_string(&settings_path)
        .unwrap_or_else(|_| "{}".to_string());
    let mut json: Value = serde_json::from_str(&content)
        .map_err(|e| format!("Invalid settings.json: {}", e))?;

    if let Some(mcp) = json.get_mut("mcpServers").and_then(|m| m.as_object_mut()) {
        if let Some(server) = mcp.get_mut(&server_name).and_then(|s| s.as_object_mut()) {
            if disabled {
                server.insert("disabled".to_string(), Value::Bool(true));
            } else {
                server.remove("disabled");
            }
        }
    }

    let new_content = serde_json::to_string_pretty(&json)
        .map_err(|e| format!("Serialize error: {}", e))?;
    std::fs::write(&settings_path, new_content).map_err(|e| e.to_string())
}

/// List installed gstack skills
#[tauri::command]
fn list_skills() -> Result<Vec<String>, String> {
    let home = home_dir()?;
    let skills_dir = home.join(".claude/skills");

    if !skills_dir.exists() {
        return Ok(vec![]);
    }

    let mut skills = vec![];
    if let Ok(entries) = std::fs::read_dir(&skills_dir) {
        for entry in entries.flatten() {
            if entry.path().is_dir() {
                if let Some(name) = entry.file_name().to_str() {
                    if !name.starts_with('.') {
                        skills.push(name.to_string());
                    }
                }
            }
        }
    }
    skills.sort();
    Ok(skills)
}

// ── Entry point ──────────────────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            check_claude_cli,
            read_buddy_info,
            read_buddy_state,
            write_buddy_state,
            send_message,
            read_mcp_servers,
            toggle_mcp_server,
            list_skills,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
