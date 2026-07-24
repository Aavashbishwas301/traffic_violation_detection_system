import axios from "axios";

const baseURL = "http://localhost:5000";

async function run() {
  console.log("--- STARTING VEHICLE ADMIN TEST ---");
  try {
    const adminLogin = await axios.post(`${baseURL}/api/users/login`, {
      email: "admin@example.com",
      password: "password123",
      role: "Admin",
    });
    const adminToken = adminLogin.data.token;
    console.log("Admin Login: SUCCESS");

    console.log("Creating a test vehicle...");
    const createRes = await axios.post(
      `${baseURL}/api/admin/vehicles`,
      {
        vehicleNumber: "TEST-PLATE-123",
        vehicleType: "4-Wheeler",
        brand: "TestBrand",
        model: "TestModel",
        color: "Blue",
        ownerId: "",
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log("Vehicle Created:", createRes.data.vehicleNumber);
    const vehicleId = createRes.data._id;

    console.log("Updating the test vehicle...");
    const updateRes = await axios.put(
      `${baseURL}/api/admin/vehicles/${vehicleId}`,
      {
        vehicleNumber: "TEST-UPDATE-456",
        color: "Red",
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    console.log("Vehicle Updated:", updateRes.data.vehicleNumber, updateRes.data.color);

    console.log("Deleting the test vehicle...");
    await axios.delete(`${baseURL}/api/admin/vehicles/${vehicleId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log("Vehicle Deleted: SUCCESS");

  } catch (error) {
    console.error("--- TEST FAILED ---");
    console.error(error.response ? error.response.data : error.message);
  }
}
run();
