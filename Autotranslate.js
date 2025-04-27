import { registerPlugin } from "enmity/managers/plugins";
import { MessageStore } from "enmity/api";
import { React, Storage, Toasts } from "enmity/metro/common";
import { getByProps } from "enmity/metro";
import Settings from "./AutoTranslateSettings"; // We'll define this later

// You'll probably need to use a real API call for translation
async function translateText(text) {
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(text)}`);
  const data = await response.json();
  return data[0][0][0];
}

const PatchMessages = getByProps("sendMessage", "editMessage");

const AutoTranslatePlugin = {
  name: "AutoTranslate",
  description: "Automatically translates Russian messages into English and shows them under the message.",
  authors: [{ name: "YourName" }],
  version: "2.0.0",
  settings: Storage.plugins.getPlugin("AutoTranslate") ?? { enabled: true },

  onStart() {
    this.unsubscribe = MessageStore.addListener("MESSAGE_CREATE", async (message) => {
      if (!this.settings.enabled) return;
      
      try {
        const content = message?.message?.content;
        if (!content) return;
        
        if (/[А-Яа-яЁё]/.test(content)) {
          const translation = await translateText(content);
          if (!translation) return;

          // Inject translated text into the message
          PatchMessages.editMessage(
            message?.message?.channel_id,
            message?.message?.id,
            {
              content: `${content}\n\n**[Translated from Russian]:** ${translation}`
            }
          );
        }
      } catch (err) {
        console.error("[AutoTranslate] Error translating:", err);
        Toasts.show({
          title: "AutoTranslate Error",
          content: "Failed to translate message.",
          duration: 3000
        });
      }
    });
  },

  onStop() {
    if (this.unsubscribe) this.unsubscribe();
  },

  getSettingsPanel() {
    return Settings(this.settings, (newSettings) => {
      this.settings = newSettings;
      Storage.plugins.setPlugin("AutoTranslate", this.settings);
    });
  }
};

registerPlugin(AutoTranslatePlugin);
