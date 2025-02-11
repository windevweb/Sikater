// Initialize Supabase client
const supabaseUrl = "https://eyzvqdknrkkjznqvmxgb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5enZxZGtucmtranpucXZteGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0OTc1NzksImV4cCI6MjA1NDA3MzU3OX0.v-3bKrF431br9SKSXPzUOHU-f4CW_4SAgtSic502sbs";

// Create Supabase client instance
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Function to fetch and display data
async function fetchProgressData() {
  try {
    const { data, error } = await supabaseClient.from("progress").select("*");
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    const progressCards = document.getElementById("progressCards");
    progressCards.innerHTML = ""; // Clear existing cards

    data.forEach((item) => {
      // Determine badge color based on status
      let statusBadgeClass = "";
      if (item.status === "diajukan") {
        statusBadgeClass = "badge-gradient-warning";
      } else if (item.status === "acc") {
        statusBadgeClass = "badge-gradient-success";
      } else if (item.status === "revisi") {
        statusBadgeClass = "badge-gradient-danger";
      }

      // Format type to uppercase and bold
      const formattedType = `<strong>${item.type.toUpperCase()}</strong>`;

      // Achievement Badge
      const achievementBadge = item.status === "acc" ? `
        <span class="badge bg-success rounded-pill">
          <i class="fas fa-trophy me-1"></i>Completed
        </span>
      ` : "";

      const card = `
        <div class="col-md-6 mb-4">
          <a href="${item.url}" target="_blank" class="card-link">
            <div class="card shadow-sm card-hover square-card position-relative">
              <div class="icon-background position-absolute top-50 start-50 translate-middle">
                <i class="fas fa-file-alt fa-5x text-muted opacity-25"></i>
              </div>
              <div class="badge-top-notch position-absolute top-0 end-0 m-2">
                <span class="badge badge-light-info rounded-pill badge-transparent">Ver.${item.versi}</span>
              </div>
              <div class="card-body">
                <p class="fw-bold">${item.judul}</p>
                <p class="small text-muted">${item.deskripsi}</p>
                <p>${formattedType}</p>
                <hr class="my-3">
                <p>
                  <span class="badge ${statusBadgeClass} rounded-pill">Status ${item.status.toUpperCase()}</span>
                  ${achievementBadge}
                </p>
              </div>
            </div>
          </a>
        </div>
      `;
      progressCards.innerHTML += card;
    });
  } catch (err) {
    console.error("Error in fetchProgressData:", err);
  }
}

// Fetch audit log data
async function fetchAuditLog() {
  try {
    const { data, error } = await supabaseClient.from("audit_logs").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching audit log:", error);
      return;
    }

    const auditLog = document.getElementById("auditLog");
    auditLog.innerHTML = ""; // Clear existing logs

    data.forEach((log) => {
      const logItem = `
        <div class="d-flex align-items-center mb-2">
          <i class="fas fa-clock me-2 text-muted"></i>
          <div>
            <p class="small mb-0">${log.action}</p>
            <p class="text-muted small">${new Date(log.created_at).toLocaleString()}</p>
          </div>
        </div>
      `;
      auditLog.innerHTML += logItem;
    });
  } catch (err) {
    console.error("Error in fetchAuditLog:", err);
  }
}

// Event listener for form submission
document.getElementById("progressForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Validation
  const judul = document.getElementById("judul").value.trim();
  const deskripsi = document.getElementById("deskripsi").value.trim();
  const versi = parseInt(document.getElementById("versi").value);
  const status = document.getElementById("status").value;
  const type = document.getElementById("type").value;
  const url = document.getElementById("url").value.trim();

  if (!judul || !deskripsi || isNaN(versi) || versi < 1 || !status || !type || !url) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Silakan isi semua kolom dengan benar!",
    });
    return;
  }

  try {
    // Insert data into the `progress` table
    const { data, error } = await supabaseClient
      .from("progress")
      .insert([{ judul, deskripsi, versi, status, type, url }])
      .select(); // Use `.select()` to ensure Supabase returns the inserted data

    if (error) {
      console.error("Error inserting data:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat menyimpan data.",
      });
      return;
    }

    // Validate that data is not empty
    if (!data || data.length === 0) {
      console.error("No data returned from Supabase.");
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Tidak ada data yang dikembalikan dari server.",
      });
      return;
    }

    // Add audit log entry
    const auditLogEntry = {
      progress_id: data[0].id,
      action: `Dokumen "${judul}" telah ditambahkan dengan status ${status.toUpperCase()}.`,
      user_id: "user_123", // Replace with actual user ID or session data
      created_at: new Date().toISOString(),
    };

    await supabaseClient.from("audit_logs").insert([auditLogEntry]);

    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Data berhasil disimpan!",
    });

    fetchProgressData(); // Refresh main data
    fetchAuditLog(); // Refresh audit log
    document.getElementById("progressForm").reset();
    bootstrap.Modal.getInstance(document.getElementById("addProgressModal")).hide();
  } catch (err) {
    console.error("Error in form submission:", err);
    Swal.fire({
      icon: "error",
      title: "Gagal!",
      text: "Terjadi kesalahan saat menyimpan data.",
    });
  }
});

// Search functionality
document.getElementById("searchInput")?.addEventListener("input", (e) => {
  const query = e.target.value.toLowerCase();
  const cards = document.querySelectorAll("#progressCards > div");

  cards.forEach((card) => {
    const judul = card.querySelector(".fw-bold").innerText.toLowerCase();
    const deskripsi = card.querySelector(".small.text-muted").innerText.toLowerCase();

    if (judul.includes(query) || deskripsi.includes(query)) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
});

// Fetch data on page load
fetchProgressData();
fetchAuditLog();