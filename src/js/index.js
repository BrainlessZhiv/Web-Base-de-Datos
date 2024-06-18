// Function to format the date as DD-MM-YYYY and correct the time zone offset
function formatDate(dateString) {
  const date = new Date(dateString);

  // Correct the time zone offset
  correctedDate = new Date(date.getTime());

  // Extract day, month, and year
  const day = correctedDate.getDate().toString().padStart(2, "0");
  const month = (correctedDate.getMonth() + 1).toString().padStart(2, "0"); // getMonth() is zero-based
  const year = correctedDate.getFullYear();

  // Format the date as DD-MM-YYYY
  return `${day}-${month}-${year}`;
}

async function LoadEntries() {
  try {
    const response = await fetch("/get-entries", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const entries = await response.json();

    const tableBody = document.querySelector("table tbody");
    tableBody.innerHTML = ""; // Clear existing entries

    entries.forEach((entry) => {
      const row = document.createElement("tr");

      const idCell = document.createElement("td");
      idCell.textContent = entry.id;
      row.appendChild(idCell);

      const nameCell = document.createElement("td");
      nameCell.textContent = entry.name;
      row.appendChild(nameCell);

      const amountCell = document.createElement("td");
      amountCell.textContent = entry.amount;
      row.appendChild(amountCell);

      const infoCell = document.createElement("td");
      infoCell.textContent = entry.info;
      row.appendChild(infoCell);

      const dateCell = document.createElement("td");
      dateCell.textContent = formatDate(entry.date);
      row.appendChild(dateCell);

      // Add a delete button or any other controls you need
      const deleteButtonCell = document.createElement("td");
      var deleteButton = document.createElement("button");
      deleteButton.className = "btn btn-danger";
      deleteButton.textContent = "🗑️";
      deleteButton.addEventListener("click", async () => {
        try {
          const response = await fetch("/delete-entry", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ id: entry.id }),
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Success:", data);
          LoadEntries();
          // Replace alert with a more user-friendly success message
          alert("Entry deleted successfully!");
        } catch (error) {
          console.error("Error:", error);
          // Optionally, inform the user about the error in a user-friendly manner
        }
      });
      deleteButtonCell.appendChild(deleteButton);
      row.appendChild(deleteButtonCell);

      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Error loading entries:", error);
    // Optionally, inform the user about the error in a user-friendly manner
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const getCellValue = (tr, idx) =>
    tr.children[idx].innerText || tr.children[idx].textContent;
  const comparer = (idx, asc) => (a, b) =>
    ((v1, v2) =>
      v1 !== "" && v2 !== "" && !isNaN(v1) && !isNaN(v2)
        ? v1 - v2
        : v1.toString().localeCompare(v2))(
      getCellValue(asc ? a : b, idx),
      getCellValue(asc ? b : a, idx)
    );

  document.querySelectorAll("th").forEach((th) =>
    th.addEventListener("click", function () {
      const table = th.closest("table");
      console.log(table);
      const tbody = table.querySelector("tbody");
      console.log(tbody);
      const isAsc = (this.asc = !this.asc);
      console.log(isAsc);
      const iconClass = isAsc ? "sort-asc" : "sort-desc";
      console.log(iconClass);

      // Remove existing sort icons
      document.querySelectorAll("th").forEach((header) => {
        header.classList.remove("sort-asc", "sort-desc");
      });

      // Add the current sort icon
      th.classList.add(iconClass);

      Array.from(tbody.querySelectorAll("tr"))
        .sort(comparer(Array.from(th.parentNode.children).indexOf(th), isAsc))
        .forEach((tr) => tbody.appendChild(tr));
    })
  );

  document
    .getElementById("entryForm")
    .addEventListener("submit", async function (e) {
      e.preventDefault(); // Prevent the default form submission

      const entryData = {
        name: document.getElementById("entryName").value,
        amount: document.getElementById("entryAmount").value,
        info: document.getElementById("entryInfo").value,
        date: document.getElementById("entryDate").value,
      };

      // Basic validation example
      if (!entryData.name || !entryData.amount || !entryData.date) {
        console.error("Please fill in all required fields.");
        return; // Stop the function if validation fails
      }

      console.log(entryData);

      try {
        const response = await fetch("/add-entry", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(entryData),
        });

        // Check if the response's content type is JSON before parsing
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response from server");
        }

        const data = await response.json();
        console.log("Success:", data);
        document.getElementById("entryForm").reset();
        // Replace alert with a more user-friendly success message
        alert("Entry added successfully!");
      } catch (error) {
        console.error("Error:", error);
        // Optionally, inform the user about the error in a user-friendly manner
      }

      LoadEntries();
    });

  LoadEntries();

  // Add a new event listener for the filter form submission
  document
    .getElementById("filterForm")
    .addEventListener("submit", function (e) {
      e.preventDefault(); // Prevent the default form submission

      // Implement the functionality for filtering entries
      // This might involve filtering the entries already present on the page.
      console.log("Filter form submitted");
      // TODO: Implement filtering functionality
    });
});
