import { registerPlugin } from "enmity/managers/plugins";
import { MessageStore } from "enmity/api";
import { React, Storage, Toasts } from "enmity/metro/common";
import { getByProps } from "enmity/metro";
import { ScrollView, View, Text, Switch } from "enmity/metro/components";

// Translator function
async function translateText(text) {
  const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=en&dt=t&q=${encodeURIComponent(text)}`);
  const data = await response.json();
  return data[0][0][0];
}

// Patch Messages API (No Edit Version)
const { MessageContent } = getByProps("sendMessage", "editMessage");

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

        // Only translate Russian messages
        if (/[А-Яа-яЁё]/.test(content)) {
          const translation = await translateText(content);
          if (!translation) return;

          // Inject a custom visual translation below the message
          MessageContent.renderMessage(message.message, (props) => {
            return (
              <>
                {props.children}
                <Text style={{ fontSize: 14, color: "#828282", marginTop: 5 }}>
                  **[Translated from Russian]:** {translation}
                </Text>
              </>
            );
          });
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
    const { useState } = React;
    return () => {
      const [enabled, setEnabled] = useState(this.settings.enabled);

      const toggle = (value) => {
        setEnabled(value);
        this.settings.enabled = value;
        Storage.plugins.setPlugin("AutoTranslate", this.settings);
      };

      return (
        <ScrollView>
          <View style={{ padding: 20 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>AutoTranslate Settings</Text>

            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 12 }}>
              <Text style={{ fontSize: 16 }}>Enable Auto-Translate</Text>
              <Switch value={enabled} onValueChange={toggle} />
            </View>
          </View>
        </ScrollView>
      );
    };
  }
};

registerPlugin(AutoTranslatePlugin);
