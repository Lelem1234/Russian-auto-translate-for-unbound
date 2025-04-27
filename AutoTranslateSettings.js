import { React } from "enmity/metro/common";
import { ScrollView, View, Text, Switch } from "enmity/metro/components";

export default (settings, onSettingsChange) => {
  return (
    <ScrollView>
      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 16 }}>AutoTranslate Settings</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginVertical: 12 }}>
          <Text style={{ fontSize: 16 }}>Enable Auto-Translate</Text>
          <Switch
            value={settings.enabled}
            onValueChange={(value) => onSettingsChange({ ...settings, enabled: value })}
          />
        </View>
      </View>
    </ScrollView>
  );
};
