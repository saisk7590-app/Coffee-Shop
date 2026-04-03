import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { COLORS, FONT } from "../../constants";
import { fetchSummary } from "../../lib/admin-api";
import { getErrorMessage } from "../../lib/api";
import { Card, ErrorText, LoadingState, Screen } from "../../lib/admin-ui";
import { useResponsive } from "../../lib/responsive";

const emptySummary = {
  total_orders: 0,
  today_orders: 0,
  today_revenue: 0,
  total_products: 0,
  pending_orders: 0,
  ready_orders: 0,
};

export default function DashboardScreen() {
  const responsive = useResponsive();
  const [summary, setSummary] = useState(emptySummary);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        setSummary(await fetchSummary());
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Failed to load dashboard"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const cards = [
    { label: "Total Orders", value: summary.total_orders },
    { label: "Today Orders", value: summary.today_orders },
    { label: "Today Revenue", value: `Rs. ${Number(summary.today_revenue).toFixed(2)}` },
    { label: "Pending Orders", value: summary.pending_orders },
    { label: "Ready Orders", value: summary.ready_orders },
    { label: "Total Products", value: summary.total_products },
  ];

  return (
    <Screen title="Dashboard">
      {error ? <ErrorText>{error}</ErrorText> : null}
      {loading ? (
        <LoadingState />
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {cards.map((item) => (
            <Card key={item.label} style={{ width: responsive.cardWidth, borderRadius: responsive.isAndroidPhone ? 12 : 14 }}>
              <Text style={{ color: COLORS.mutedText, marginBottom: 6, fontSize: responsive.smallSize }}>
                {item.label}
              </Text>
              <Text
                style={{
                  color: COLORS.text,
                  fontSize: responsive.subtitleSize,
                  fontWeight: "bold",
                }}
              >
                {item.value}
              </Text>
            </Card>
          ))}
        </View>
      )}

      <Card style={{ backgroundColor: "#fef7ee", borderColor: "#f1dcc2", borderRadius: responsive.isAndroidPhone ? 12 : 14 }}>
        <Text style={{ color: "#7b4f1d", fontWeight: "700", marginBottom: 4, fontSize: FONT.normal }}>
          Cafe Snapshot
        </Text>
        <Text style={{ color: "#7b4f1d", fontSize: responsive.bodySize }}>
          Live order and product activity is shown here in a responsive owner dashboard layout for mobile, tablet, and POS screens.
        </Text>
      </Card>
    </Screen>
  );
}
