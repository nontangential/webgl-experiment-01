if (window.__bg_engine_plugin_settings) {
    console.error("duplicate plugin settings")
}
window.__bg_engine_plugin_settings = function() {
    return {
        color: [0.333, 0.666, 0.999]
    }
}