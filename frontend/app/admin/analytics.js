import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { COLORS } from "../../constants";
import {
  fetchOrderStatus,
  fetchOrdersTrend,
  fetchRevenueTrend,
  fetchTopItems,
} from "../../lib/admin-api";
import { getErrorMessage } from "../../lib/api";
import { Card, EmptyState, ErrorText, LoadingState, MiniChart, Screen, SectionTitle } from "../../lib/admin-ui";
import { useResponsive } from "../../lib/responsive";

const emptyStatus = {
  Pending: 0,
  Ready: 0,
  Completed: 0,
};

export default function AnalyticsScreen() {
  const responsive = useResponsive();
  const [ordersTrend, setOrdersTrend] = useState([]);
  const [revenueTrend, setRevenueTrend] = useState([]);
  const [topItems, setTopItems] = useState([]);
  const [status, setStatus] = useState(emptyStatus);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const [ordersData, revenueData, itemsData, statusData] = await Promise.all([
          fetchOrdersTrend(),
          fetchRevenueTrend(),
          fetchTopItems(),
          fetchOrderStatus(),
        ]);

        setOrdersTrend(ordersData);
        setRevenueTrend(revenueData);
        setTopItems(itemsData);
        setStatus(statusData);
      } catch (loadError) {
        setError(getErrorMessage(loadError, "Failed to load analytics"));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <Screen title="Analytics">
      {error ? <ErrorText>{error}</ErrorText> : null}
      {loading ? (
        <LoadingState />
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          <Card style={{ width: responsive.isMobile ? "100%" : "48%" }}>
            <SectionTitle>Orders Trend</SectionTitle>
            {ordersTrend.length ? (
              <MiniChart data={ordersTrend} valueKey="total_orders" color={COLORS.primary} />
            ) : (
              <EmptyState>No order trend data available.</EmptyState>
            )}
          </Card>

          <Card style={{ width: responsive.isMobile ? "100%" : "48%" }}>
            <SectionTitle>Revenue Trend</SectionTitle>
            {revenueTrend.length ? (
              <MiniChart data={revenueTrend} valueKey="total_revenue" color={COLORS.accent} />
            ) : (
              <EmptyState>No revenue data available.</EmptyState>
            )}
          </Card>

          <Card style={{ width: responsive.isLarge ? "64%" : "100%" }}>
            <SectionTitle>Top Selling Items</SectionTitle>
            {topItems.length ? (
              topItems.map((item) => (
                <View
                  key={`${item.item_type}-${item.id}`}
                  style={{
                    paddingVertical: 10,
                    borderBottomWidth: 1,
                    borderBottomColor: COLORS.divider,
                  }}
                >
                  <Text style={{ color: COLORS.text, fontWeight: "700", fontSize: responsive.bodySize }}>
                    {item.item_name}
                  </Text>
                  <Text style={{ color: COLORS.mutedText, fontSize: responsive.smallSize }}>
                    {String(item.item_type).toUpperCase()} - Sold {item.total_quantity}
                  </Text>
                </View>
              ))
            ) : (
              <EmptyState>No sales data available.</EmptyState>
            )}
          </Card>

          <Card style={{ width: responsive.isLarge ? "32%" : "100%" }}>
            <SectionTitle>Order Status</SectionTitle>
            <View style={{ gap: responsive.gap / 1.5 }}>
              {Object.entries(status).map(([label, value]) => (
                <View
                  key={label}
                  style={{
                    backgroundColor: COLORS.surface,
                    borderWidth: 1,
                    borderColor: COLORS.border,
                    borderRadius: 10,
                    padding: responsive.isLarge ? 18 : 12,
                  }}
                >
                  <Text style={{ color: COLORS.mutedText, fontSize: responsive.smallSize }}>{label}</Text>
                  <Text style={{ color: COLORS.text, fontWeight: "700", fontSize: responsive.subtitleSize }}>
                    {value}
                  </Text>
                </View>
              ))}
            </View>
          </Card>
        </View>
      )}
    </Screen>
  );
}
