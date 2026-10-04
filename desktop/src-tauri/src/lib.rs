#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let context = tauri::generate_context!();
    let updates_configured = context
        .config()
        .plugins
        .0
        .get("updater")
        .and_then(|config| config.get("pubkey"))
        .and_then(serde_json::Value::as_str)
        .is_some_and(|key| !key.trim().is_empty());
    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init());
    if updates_configured {
        builder = builder.plugin(tauri_plugin_updater::Builder::new().build());
    }
    builder
        .run(context)
        .expect("Unable to initialize INTERSTELLAR Observatory");
}
