// Add interactivity to the "Go Back" button
document.getElementById("goBackButton").addEventListener("click", () => {
    // Go back to the previous page in browser history
    window.history.back();
  });
  
  // Optional: Add a fun alert when the user clicks the illustration
  document.querySelector(".animated-float").addEventListener("click", () => {
    Swal.fire({
      title: "Oh no!",
      text: "This illustration is just here for fun. Try going back!",
      icon: "info",
      confirmButtonText: "Got it!",
    });
  });