// Initialize Supabase client
const supabaseUrl = "https://eyzvqdknrkkjznqvmxgb.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5enZxZGtucmtranpucXZteGdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0OTc1NzksImV4cCI6MjA1NDA3MzU3OX0.v-3bKrF431br9SKSXPzUOHU-f4CW_4SAgtSic502sbs";

// Create Supabase client instance
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// DOM Elements
const literaturForm = document.getElementById("literaturForm");
const literaturTableBody = document.getElementById("literaturTableBody");
const resetButton = document.getElementById("resetButton");

// Load data from Supabase
async function loadData() {
  try {
    const { data, error } = await supabaseClient.from("studi_literatur").select("*");
    if (error) throw error;

    // Clear table body
    literaturTableBody.innerHTML = "";

    // Populate table with data
    data.forEach((item, index) => {
      const row = `
        <tr>
          <td>${index + 1}</td>
          <td>${item.judul}</td>
          <td>${item.penulis}</td>
          <td>${item.tahun}</td>
          <td><a href="${item.link}" target="_blank">${item.link}</a></td>
          <td>
            <button class="btn btn-sm btn-warning edit-btn" data-id="${item.id}">
              <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `;
      literaturTableBody.insertAdjacentHTML("beforeend", row);
    });

    // Add event listeners to buttons
    document.querySelectorAll(".edit-btn").forEach((button) => {
      button.addEventListener("click", handleEdit);
    });
    document.querySelectorAll(".delete-btn").forEach((button) => {
      button.addEventListener("click", handleDelete);
    });
  } catch (error) {
    console.error("Error loading data:", error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Gagal memuat data!",
    });
  }
}

// Handle form submission
literaturForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("literaturId").value;
  const judul = document.getElementById("judul").value;
  const penulis = document.getElementById("penulis").value;
  const tahun = document.getElementById("tahun").value;
  const link = document.getElementById("link").value;

  try {
    if (id) {
      // Update existing record
      const { error } = await supabaseClient
        .from("studi_literatur")
        .update({ judul, penulis, tahun, link })
        .eq("id", id);
      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data berhasil diperbarui.",
      });
    } else {
      // Insert new record
      const { error } = await supabaseClient
        .from("studi_literatur")
        .insert([{ judul, penulis, tahun, link }]);
      if (error) throw error;

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data berhasil ditambahkan.",
      });
    }

    // Reset form and reload data
    resetForm();
    loadData();
  } catch (error) {
    console.error("Error saving data:", error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Gagal menyimpan data!",
    });
  }
});

// Handle edit button click
function handleEdit(e) {
  const id = e.target.closest("button").dataset.id;
  const row = e.target.closest("tr");
  const cells = row.querySelectorAll("td");

  document.getElementById("literaturId").value = id;
  document.getElementById("judul").value = cells[1].innerText;
  document.getElementById("penulis").value = cells[2].innerText;
  document.getElementById("tahun").value = cells[3].innerText;
  document.getElementById("link").value = cells[4].querySelector("a").href;
}

// Handle delete button click
async function handleDelete(e) {
  const id = e.target.closest("button").dataset.id;

  const confirmDelete = await Swal.fire({
    title: "Apakah Anda yakin?",
    text: "Data yang dihapus tidak dapat dikembalikan!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, hapus!",
    cancelButtonText: "Batal",
  });

  if (!confirmDelete.isConfirmed) return;

  try {
    const { error } = await supabaseClient
      .from("studi_literatur")
      .delete()
      .eq("id", id);
    if (error) throw error;

    Swal.fire({
      icon: "success",
      title: "Berhasil!",
      text: "Data berhasil dihapus.",
    });

    // Reload data
    loadData();
  } catch (error) {
    console.error("Error deleting data:", error);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Gagal menghapus data!",
    });
  }
}

// Reset form
resetButton.addEventListener("click", resetForm);

function resetForm() {
  document.getElementById("literaturId").value = "";
  literaturForm.reset();
}

// Initial load
loadData();