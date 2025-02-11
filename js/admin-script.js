// Initialize Supabase client
const supabaseUrl = "https://eyzvqdknrkkjznqvmxgb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5enZxZGtucmtranpucXZteGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0OTc1NzksImV4cCI6MjA1NDA3MzU3OX0.v-3bKrF431br9SKSXPzUOHU-f4CW_4SAgtSic502sbs";
// Create Supabase client instance
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// Function to fetch and display data
async function fetchAdminData() {
  try {
    const { data, error } = await supabaseClient.from("progress").select("*");
    if (error) {
      console.error("Error fetching data:", error);
      return;
    }
    const adminCards = document.getElementById("adminCards");
    adminCards.innerHTML = ""; // Clear existing cards
    data.forEach((item) => {
      const card = `
        <div class="col-md-4 mb-4">
          <div class="card shadow-sm card-hover square-card position-relative">
            <div class="badge-top-notch position-absolute top-0 end-0 m-2">
              <span class="badge badge-light-info rounded-pill badge-transparent">Ver.${item.versi}</span>
            </div>
            <div class="card-body">
              <p class="fw-bold">${item.judul}</p>
              <p class="small text-muted">${item.deskripsi}</p>
              <p><strong>${item.type.toUpperCase()}</strong></p>
              <hr class="my-3">
              <p>
                <span class="badge ${getStatusBadgeClass(item.status)} rounded-pill">Status ${item.status.toUpperCase()}</span>
              </p>
              <div class="d-flex justify-content-between">
                <button class="btn btn-warning btn-sm" onclick="openEditModal(${item.id}, '${item.judul}', '${item.deskripsi}', ${item.versi}, '${item.status}', '${item.type}', '${item.url}')">
                  <i class="fas fa-edit me-1"></i>Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteDocument(${item.id})">
                  <i class="fas fa-trash-alt me-1"></i>Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      adminCards.innerHTML += card;
    });
  } catch (err) {
    console.error("Error in fetchAdminData:", err);
  }
}

// Helper function to determine badge color based on status
function getStatusBadgeClass(status) {
  if (status === "diajukan") {
    return "badge-gradient-warning";
  } else if (status === "acc") {
    return "badge-gradient-success";
  } else if (status === "revisi") {
    return "badge-gradient-danger";
  }
}

// Open Edit Modal
function openEditModal(id, judul, deskripsi, versi, status, type, url) {
  document.getElementById("editId").value = id;
  document.getElementById("editJudul").value = judul;
  document.getElementById("editDeskripsi").value = deskripsi;
  document.getElementById("editVersi").value = versi;
  document.getElementById("editStatus").value = status;
  document.getElementById("editType").value = type;
  document.getElementById("editUrl").value = url;
  const editModal = new bootstrap.Modal(document.getElementById("editModal"));
  editModal.show();
}

// Event listener for form submission (Edit)
document.getElementById("editForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const id = document.getElementById("editId").value;
  const judul = document.getElementById("editJudul").value.trim();
  const deskripsi = document.getElementById("editDeskripsi").value.trim();
  const versi = parseInt(document.getElementById("editVersi").value);
  const status = document.getElementById("editStatus").value;
  const type = document.getElementById("editType").value;
  const url = document.getElementById("editUrl").value.trim();
  if (!judul || !deskripsi || isNaN(versi) || versi < 1 || !status || !type || !url) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Silakan isi semua kolom dengan benar!",
    });
    return;
  }
  try {
    const { error } = await supabaseClient
      .from("progress")
      .update({ judul, deskripsi, versi, status, type, url })
      .eq("id", id);
    if (error) {
      console.error("Error updating data:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat memperbarui data.",
      });
      return;
    }
    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Data berhasil diperbarui!",
    });
    fetchAdminData(); // Refresh data
    bootstrap.Modal.getInstance(document.getElementById("editModal")).hide();
  } catch (err) {
    console.error("Error in form submission:", err);
    Swal.fire({
      icon: "error",
      title: "Gagal!",
      text: "Terjadi kesalahan saat memperbarui data.",
    });
  }
});

// Function to delete a document
async function deleteDocument(id) {
  Swal.fire({
    title: 'Apakah Anda yakin?',
    text: 'Data ini akan dihapus secara permanen!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Ya, hapus!',
    cancelButtonText: 'Batal',
  }).then(async (result) => {
    if (result.isConfirmed) {
      try {
        // Attempt to delete related data first (if applicable)
        await supabaseClient.from("related_table").delete().eq("progress_id", id); // Adjust table name if needed

        // Delete the main data
        const { error } = await supabaseClient
          .from("progress")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Error deleting data:", error); // Log detailed error
          Swal.fire({
            icon: "error",
            title: "Gagal!",
            text: error.message || "Terjadi kesalahan saat menghapus data.",
          });
          return;
        }

        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data berhasil dihapus!",
        });
        fetchAdminData(); // Refresh data
      } catch (err) {
        console.error("Error in deleteDocument:", err);
        Swal.fire({
          icon: "error",
          title: "Gagal!",
          text: "Terjadi kesalahan saat menghapus data.",
        });
      }
    }
  });
}

// Fetch data on page load
fetchAdminData();