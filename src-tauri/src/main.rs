// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
use std::process::Command;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn run_powershell_script(script_path: String) -> Result<String, String> {
    let result = Command::new("powershell.exe")
        .arg("-executionpolicy")
        .arg("bypass")
        .arg("-File")
        .arg(script_path)
        .output()
        .map_err(|e| format!("Failed to execute PowerShell script: {:?}", e))?;

    if result.status.success() {
        Ok(String::from_utf8_lossy(&result.stdout).to_string())
    } else {
        Err(String::from_utf8_lossy(&result.stderr).to_string())
    }
}

#[tauri::command]
fn run_external_exe(exe_path: String) -> Result<(), String> {
    // Command to execute your .exe file
    let mut child = Command::new(exe_path).spawn().map_err(|e| e.to_string())?;

    let _result = child.wait().map_err(|e| e.to_string())?;

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![greet])
        .invoke_handler(tauri::generate_handler![run_powershell_script])
        .invoke_handler(tauri::generate_handler![run_external_exe])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
