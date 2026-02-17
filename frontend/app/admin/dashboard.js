import { View, Text } from "react-native";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  const [totalOrders, setTotalOrders] = useState(0);

  useEffect(() => {
    fetchTodayOrders();
  }, []);

  const fetchTodayOrders = async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", today);

    if (!error) setTotalOrders(data.length);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20 }}>
        Today Orders: {totalOrders}
      </Text>
    </View>
  );
}
