import { Tabs } from "expo-router";

export default function AdminLayout() {
  return (
    <Tabs>
      <Tabs.Screen 
        name="dashboard" 
        options={{ title: "Dashboard" }} 
      />
      <Tabs.Screen 
        name="analytics" 
        options={{ title: "Analytics" }} 
      />
      <Tabs.Screen 
        name="orders" 
        options={{ title: "Orders" }} 
      />
      <Tabs.Screen 
        name="menu" 
        options={{ title: "Menu" }} 
      />
    </Tabs>
  );
}
