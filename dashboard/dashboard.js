// Check authentication status
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/me', {
            credentials: 'include'
        });
        const data = await response.json();
        return data.data; // Return user data if authenticated
    } catch (error) {
        console.error('Auth check failed:', error);
        return null;
    }
}

// Initialize the dashboard with auth check
document.addEventListener("DOMContentLoaded", async () => {
    // Check authentication once at startup
    const user = await checkAuth();
    if (!user) {
        window.location.href = '/#login';
        return;
    }

    // Initialize all dashboard functionality
    loadAndRenderDeals();
    setupEventListeners();
});

// Setup all event listeners
function setupEventListeners() {
    // Handle submenu toggle
    const submenuTrigger = document.querySelector(".has-submenu > a");
    const submenuContainer = document.querySelector(".has-submenu");
    const submenu = document.querySelector(".submenu");

    if (submenuTrigger && submenuContainer && submenu) {
        submenuTrigger.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();

            submenuContainer.classList.toggle("active");
            const arrow = submenuTrigger.querySelector(".submenu-arrow");

            if (submenuContainer.classList.contains("active")) {
                submenu.style.maxHeight = submenu.scrollHeight + "px";
                if (arrow) arrow.style.transform = "rotate(180deg)";
            } else {
                submenu.style.maxHeight = "0px";
                if (arrow) arrow.style.transform = "rotate(0deg)";
            }
        });
    }

    // Add click handler for new deal button
    document.getElementById("addDealBtn")?.addEventListener("click", loadNewDealForm);

    // Handle search input
    const searchInput = document.querySelector(".header-search input");
    searchInput?.addEventListener("input", (e) => {
        console.log("Search query:", e.target.value);
    });

    // Handle notification click
    const notificationBtn = document.querySelector(".notifications");
    notificationBtn?.addEventListener("click", () => {
        alert("Notifications clicked");
    });

    // Handle profile click
    const profileBtn = document.querySelector(".user-profile");
    profileBtn?.addEventListener("click", () => {
        alert("Profile clicked");
    });
}

// Fetch and display deals
async function fetchDeals() {
    try {
        const response = await fetch("/api/deals", {
            credentials: 'include'
        });
        const data = await response.json();

        let dealsToDisplay = [];
        if (data.success && data.data) {
            dealsToDisplay = data.data;
        } else if (Array.isArray(data)) {
            dealsToDisplay = data;
        } else {
            console.error("Failed to fetch deals:", data.error);
            dealsToDisplay = [
                { _id: "1", name: "Test Deal 1" },
                { _id: "2", name: "Test Deal 2" },
                { _id: "3", name: "Test Deal 3" },
            ];
        }
        populateDealsSubmenu(dealsToDisplay);
        console.log("Deals fetched successfully:", dealsToDisplay);
    } catch (error) {
        console.error("Error fetching deals:", error);
        const testDeals = [{ _id: "1", name: "Error fetching Deals" }];
        populateDealsSubmenu(testDeals);
    }
}

// Populate deals submenu
function populateDealsSubmenu(deals) {
  const submenu = document.querySelector(".submenu");
  const submenuContainer = document.querySelector(".has-submenu");

  if (!submenu || !submenuContainer) {
    console.error("Submenu elements not found");
    return;
  }

  // Clear existing submenu items
  submenu.innerHTML = "";

  // Add each deal to the submenu
  deals.forEach((deal) => {
    const li = document.createElement("li");
    li.innerHTML = `
            <a href="#" data-deal-id="${deal._id}">
                ${deal.name}
            </a>
        `;

    // Add click event to load deal details
    li.querySelector("a").addEventListener("click", (e) => {
      e.preventDefault();
      // Pass the entire deal object to loadDealDetails
      loadDealDetails(deal);

      // Remove active class from all deal links
      submenu
        .querySelectorAll("a")
        .forEach((a) => a.classList.remove("active"));
      // Add active class to clicked deal
      e.target.classList.add("active");
    });

    submenu.appendChild(li);
  });

  // Show the submenu after populating
  if (deals.length > 0) {
    submenuContainer.classList.add("active");
    const submenuElement = submenuContainer.querySelector(".submenu");
    if (submenuElement) {
      submenuElement.style.maxHeight = submenuElement.scrollHeight + "px";
    }
    const arrow = submenuContainer.querySelector(".submenu-arrow");
    if (arrow) {
      arrow.style.transform = "rotate(180deg)";
    }
  }
}

// Add event handlers after loading deal details
function setupFormHandlers() {
  // Existing handlers
  setupDetailedDescriptionHandlers();
  setupUseCaseHandlers();
  setupBenefitHandlers();
  setupCriteriaHandlers();
  setupFAQHandlers();

  // New handlers
  setupWhatsIncludedHandlers();
  setupReviewHandlers();
}

function setupWhatsIncludedHandlers() {
  const whatsIncludedContainer = document.getElementById("whatsIncluded");
  if (!whatsIncludedContainer) return;

  const addBtn = whatsIncludedContainer.querySelector(".add-included-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const newItem = document.createElement("div");
      newItem.className = "included-item";
      newItem.innerHTML = `
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="form-control included-title">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-control included-description"></textarea>
                </div>
                <button type="button" class="remove-btn">×</button>
            `;

      // Insert before the add button
      addBtn.parentElement.insertBefore(newItem, addBtn);

      // Add remove button handler
      const removeBtn = newItem.querySelector(".remove-btn");
      removeBtn.addEventListener("click", () => newItem.remove());
    });
  }

  // Add remove button handlers for existing items
  whatsIncludedContainer
    .querySelectorAll(".included-item .remove-btn")
    .forEach((btn) => {
      btn.addEventListener("click", () =>
        btn.closest(".included-item").remove()
      );
    });
}

function setupReviewHandlers() {
  const reviewsContainer = document.getElementById("reviews");
  if (!reviewsContainer) return;

  const addBtn = reviewsContainer.querySelector(".add-review-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const newItem = document.createElement("div");
      newItem.className = "review-item";
      newItem.innerHTML = `
                <div class="form-group">
                    <label>User Name</label>
                    <input type="text" class="form-control review-username">
                </div>
                <div class="form-group">
                    <label>Rating</label>
                    <input type="number" min="1" max="5" class="form-control review-rating" value="5">
                </div>
                <div class="form-group">
                    <label>Comment</label>
                    <textarea class="form-control review-comment"></textarea>
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" class="form-control review-date" value="${
                      new Date().toISOString().split("T")[0]
                    }">
                </div>
                <button type="button" class="remove-btn">×</button>
            `;

      // Insert before the add button
      addBtn.parentElement.insertBefore(newItem, addBtn);

      // Add remove button handler
      const removeBtn = newItem.querySelector(".remove-btn");
      removeBtn.addEventListener("click", () => newItem.remove());
    });
  }

  // Add remove button handlers for existing items
  reviewsContainer
    .querySelectorAll(".review-item .remove-btn")
    .forEach((btn) => {
      btn.addEventListener("click", () => btn.closest(".review-item").remove());
    });
}

// Setup remove buttons
function setupRemoveButtons() {
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest('[class$="-item"]').remove();
    });
  });
}

let currentDealId = null;

// Handle image upload with auth check
async function handleImageUpload() {
    const imageInput = document.getElementById("dealImage");
    let imageUrl = imageInput.getAttribute("data-original-url");

    if (imageInput.files && imageInput.files[0]) {
        const formData = new FormData();
        formData.append("image", imageInput.files[0]);

        try {
            const imageResponse = await fetch("/api/images/upload", {
                method: "POST",
                body: formData,
                credentials: 'include'
            });

            const imageResult = await imageResponse.json();
            if (imageResult.success) {
                imageUrl = imageResult.imageUrl;
            } else {
                throw new Error("Failed to upload image");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            throw new Error("Failed to upload image. Please try again.");
        }
    }

    return imageUrl;
}

// Save section changes with auth check
async function saveSectionChanges(section, sectionData) {
    if (!currentDealId) {
        alert("No deal selected");
        return;
    }

    try {
        // Handle image upload if it's in the basic info section
        let imageUrl = null;
        if (section === "basicInfo") {
            imageUrl = await handleImageUpload();
        }

        // Gather all current form data
        const dealData = {
            name: document.getElementById("dealName").value,
            description: document.getElementById("dealDescription").value,
            imageUrl:
                imageUrl ||
                document.getElementById("dealImage").getAttribute("data-original-url"),
            details: [
                {
                    originalPrice: parseFloat(
                        document.getElementById("originalPrice").value
                    ),
                    discountedPrice: parseFloat(
                        document.getElementById("discountedPrice").value
                    ),
                    rating: document.querySelector(".rating")?.textContent || 0,
                    numberOfPeopleRedeemed:
                        document.querySelector(".redemptions")?.textContent || 0,
                },
            ],
            detailedDescription: Array.from(
                document.querySelectorAll(".detailed-desc-item")
            ).map((item) => ({
                title: item.querySelector(".desc-title").value,
                content: item.querySelector(".desc-content").value,
            })),
            useCases: Array.from(
                document.querySelectorAll(".use-case-item input")
            ).map((input) => input.value),
            keyBenefits: Array.from(document.querySelectorAll(".benefit-item")).map(
                (item) => ({
                    title: item.querySelector(".benefit-title").value,
                    content: item.querySelector(".benefit-content").value,
                })
            ),
            eligibilityCriteria: Array.from(
                document.querySelectorAll(".criteria-item input")
            ).map((input) => input.value),
            faq: Array.from(document.querySelectorAll(".faq-item")).map((item) => ({
                question: item.querySelector(".faq-question").value,
                answer: item.querySelector(".faq-answer").value,
            })),
            whatsIncluded: Array.from(
                document.querySelectorAll(".included-item")
            ).map((item) => ({
                title: item.querySelector(".included-title").value,
                content: item.querySelector(".included-description").value,
            })),
            reviews: Array.from(document.querySelectorAll(".review-item")).map(
                (item) => ({
                    userName: item.querySelector(".review-username").value,
                    rating: parseInt(item.querySelector(".review-rating").value),
                    comment: item.querySelector(".review-comment").value,
                    date: item.querySelector(".review-date").value,
                })
            ),
        };

        // Update the specific section with new data
        switch (section) {
            case "basicInfo":
                dealData.name = sectionData.name;
                dealData.description = sectionData.description;
                break;
            case "details":
                dealData.details = sectionData;
                break;
            case "detailedDescription":
                dealData.detailedDescription = sectionData;
                break;
            case "useCases":
                dealData.useCases = sectionData;
                break;
            case "keyBenefits":
                dealData.keyBenefits = sectionData;
                break;
            case "eligibilityCriteria":
                dealData.eligibilityCriteria = sectionData;
                break;
            case "faq":
                dealData.faq = sectionData;
                break;
            case "whatsIncluded":
                dealData.whatsIncluded = sectionData;
                break;
            case "reviews":
                dealData.reviews = sectionData;
                break;
        }

        const response = await fetch(`/api/deals/${currentDealId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include', // Add credentials for authenticated requests
            body: JSON.stringify(dealData),
        });

        const result = await response.json();

        if (result.success) {
            alert(`${section} updated successfully!`);
        } else {
            alert(`Error updating ${section}: ${result.error}`);
        }
    } catch (error) {
        console.error(`Error updating ${section}:`, error);
        alert(`Error updating ${section}. Please try again.`);
    }
}

// Save new deal with auth check
async function saveNewDeal() {
    try {
        const imageUrl = await handleImageUpload();

        const dealData = {
            _id: currentDealId,
            name: document.getElementById("dealName").value,
            description: document.getElementById("dealDescription").value,
            imageUrl: imageUrl,
            details: [
                {
                    originalPrice: parseFloat(
                        document.getElementById("originalPrice").value
                    ),
                    discountedPrice: parseFloat(
                        document.getElementById("discountedPrice").value
                    ),
                },
            ],
            detailedDescription: Array.from(
                document.querySelectorAll(".detailed-desc-item")
            ).map((item) => ({
                title: item.querySelector(".desc-title").value,
                content: item.querySelector(".desc-content").value,
            })),
            whatsIncluded: Array.from(
                document.querySelectorAll(".included-item")
            ).map((item) => ({
                title: item.querySelector(".included-title").value,
                content: item.querySelector(".included-description").value,
            })),
            reviews: Array.from(document.querySelectorAll(".review-item")).map(
                (item) => ({
                    userName: item.querySelector(".review-username").value,
                    rating: parseInt(item.querySelector(".review-rating").value),
                    comment: item.querySelector(".review-comment").value,
                    date: item.querySelector(".review-date").value,
                })
            ),
            useCases: Array.from(
                document.querySelectorAll(".use-case-item input")
            ).map((input) => input.value),
            keyBenefits: Array.from(document.querySelectorAll(".benefit-item")).map(
                (item) => ({
                    title: item.querySelector(".benefit-title").value,
                    content: item.querySelector(".benefit-content").value,
                })
            ),
            eligibilityCriteria: Array.from(
                document.querySelectorAll(".criteria-item input")
            ).map((input) => input.value),
            faq: Array.from(document.querySelectorAll(".faq-item")).map((item) => ({
                question: item.querySelector(".faq-question").value,
                answer: item.querySelector(".faq-answer").value,
            })),
        };

        const response = await fetch("/api/deals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: 'include', // Add credentials for authenticated requests
            body: JSON.stringify(dealData),
        });

        const result = await response.json();

        if (response.ok) {
            alert("Deal created successfully!");
            await fetchDeals();
            cancelNewDeal();
        } else {
            alert("Error creating deal: " + result.error);
        }
    } catch (error) {
        console.error("Error creating deal:", error);
        alert("Error creating deal. Please try again.");
    }
}

// Update setupDealEventHandlers to handle the new sections
function setupDealEventHandlers(dealData) {
  const editBtn = document.querySelector(".edit-deal-btn");
  const saveBtn = document.querySelector(".save-deal-btn");
  const cancelBtn = document.querySelector(".cancel-edit-btn");
  const form = document.querySelector(".deal-form");
  console.log(editBtn, saveBtn, cancelBtn, form);

  // Add image preview functionality
  const dealImage = document.getElementById("dealImage");
  if (dealImage) {
    dealImage.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const preview = dealImage
            .closest(".image-upload-container")
            .querySelector(".image-preview");
          preview.innerHTML = `<img src="${e.target.result}" alt="Deal image preview">`;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (editBtn && saveBtn && cancelBtn && form) {
    // Edit button handler
    editBtn.addEventListener("click", () => {
      console.log("editBtn clicked 2");
      // Show save and cancel buttons
      editBtn.style.display = "none";
      saveBtn.style.display = "inline-flex";
      cancelBtn.style.display = "inline-flex";

      // Make all inputs editable
      form.querySelectorAll("input, textarea").forEach((input) => {
        input.removeAttribute("readonly");
        if (input.type === "file") {
          input.removeAttribute("disabled");
        }
      });

      // Show all add and remove buttons
      form
        .querySelectorAll(
          ".add-desc-btn, .add-usecase-btn, .add-benefit-btn, .add-criteria-btn, .add-faq-btn, .add-included-btn, .add-review-btn, .remove-btn"
        )
        .forEach((btn) => {
          btn.style.display = "block";
        });

      // Setup add buttons
      setupAddButtons();
    });

    // Save button handler
    saveBtn.addEventListener("click", async () => {
      try {
        // Handle image upload first if there's a new image
        const imageUrl = await handleImageUpload();

        const updatedData = {
          _id: dealData._id,
          name: form.querySelector('input[type="text"]').value,
          description: form.querySelector("textarea").value,
          imageUrl: imageUrl, // Add the image URL to the deal data
          details: [
            {
              originalPrice: parseFloat(
                form.querySelector('input[type="number"]').value
              ),
              discountedPrice: parseFloat(
                form.querySelectorAll('input[type="number"]')[1].value
              ),
              rating: dealData.details?.[0]?.rating || 0,
              numberOfPeopleRedeemed:
                dealData.details?.[0]?.numberOfPeopleRedeemed || 0,
            },
          ],
          detailedDescription: Array.from(
            form.querySelectorAll(".description-item")
          ).map((item) => ({
            title: item.querySelector(".desc-title").value,
            content: item.querySelector(".desc-content").value,
          })),
          useCases: Array.from(
            form.querySelectorAll(".use-case-item input")
          ).map((input) => input.value),
          keyBenefits: Array.from(form.querySelectorAll(".benefit-item")).map(
            (item) => ({
              title: item.querySelector(".benefit-title").value,
              content: item.querySelector(".benefit-content").value,
            })
          ),
          eligibilityCriteria: Array.from(
            form.querySelectorAll(".criteria-item input")
          ).map((input) => input.value),
          faq: Array.from(form.querySelectorAll(".faq-item")).map((item) => ({
            question: item.querySelector(".faq-question").value,
            answer: item.querySelector(".faq-answer").value,
          })),
          whatsIncluded: Array.from(
            form.querySelectorAll(".included-item")
          ).map((item) => ({
            title: item.querySelector(".included-title").value,
            content: item.querySelector(".included-description").value,
          })),
          reviews: Array.from(form.querySelectorAll(".review-item")).map(
            (item) => ({
              userName: item.querySelector(".review-username").value,
              rating: parseInt(item.querySelector(".review-rating").value),
              comment: item.querySelector(".review-comment").value,
              date: item.querySelector(".review-date").value,
            })
          ),
        };

        const response = await fetch(
          `/api/deals/${dealData._id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
          }
        );

        const result = await response.json();

        if (result.success) {
          alert("Deal updated successfully!");
          // Reload the deals list and details
          await fetchDeals();
          loadDealDetails(updatedData);
        } else {
          throw new Error(result.error || "Failed to update deal");
        }
      } catch (error) {
        console.error("Error updating deal:", error);
        alert("Error updating deal. Please try again.");
      }
    });

    // Cancel button handler
    cancelBtn.addEventListener("click", () => {
      // Show edit button, hide save and cancel
      editBtn.style.display = "inline-flex";
      saveBtn.style.display = "none";
      cancelBtn.style.display = "none";

      // Reset all inputs to original values and make them readonly
      form.querySelectorAll("input, textarea").forEach((input) => {
        input.value = input.dataset.original;
        if (input.type === "file") {
          input.setAttribute("disabled", true);
        } else {
          input.setAttribute("readonly", true);
        }
      });

      // Reset image preview to original
      const imagePreview = form.querySelector(".image-preview");
      if (imagePreview && dealData.imageUrl) {
        imagePreview.innerHTML = `<img src="${dealData.imageUrl}" alt="Deal image">`;
      } else if (imagePreview) {
        imagePreview.innerHTML =
          '<div class="no-image">No image uploaded</div>';
      }

      // Hide all add and remove buttons
      form
        .querySelectorAll(
          ".add-desc-btn, .add-usecase-btn, .add-benefit-btn, .add-criteria-btn, .add-faq-btn, .add-included-btn, .add-review-btn, .remove-btn"
        )
        .forEach((btn) => {
          btn.style.display = "none";
        });

      // Remove any newly added items
      form
        .querySelectorAll('[data-new="true"]')
        .forEach((item) => item.remove());
    });
  }
}

function setupAddButtons() {
  // Add Description handler
  document.querySelector(".add-desc-btn")?.addEventListener("click", () => {
    const container = document.getElementById("detailedDescriptions");
    const newDesc = document.createElement("div");
    newDesc.className = "description-item";
    newDesc.dataset.new = "true";
    newDesc.innerHTML = `
            <input type="text" class="form-control desc-title" placeholder="Enter title">
            <textarea class="form-control desc-content" placeholder="Enter description"></textarea>
            <button type="button" class="remove-btn">×</button>
        `;
    container.insertBefore(newDesc, container.lastElementChild);
  });

  // Add Use Case handler
  document.querySelector(".add-usecase-btn")?.addEventListener("click", () => {
    const container = document.getElementById("useCases");
    const newUseCase = document.createElement("div");
    newUseCase.className = "use-case-item";
    newUseCase.dataset.new = "true";
    newUseCase.innerHTML = `
            <input type="text" class="form-control" placeholder="Enter use case">
            <button type="button" class="remove-btn">×</button>
        `;
    container.insertBefore(newUseCase, container.lastElementChild);
  });

  // Add Benefit handler
  document.querySelector(".add-benefit-btn")?.addEventListener("click", () => {
    const container = document.getElementById("keyBenefits");
    const newBenefit = document.createElement("div");
    newBenefit.className = "benefit-item";
    newBenefit.dataset.new = "true";
    newBenefit.innerHTML = `
            <input type="text" class="form-control benefit-title" placeholder="Enter title">
            <textarea class="form-control benefit-content" placeholder="Enter benefit description"></textarea>
            <button type="button" class="remove-btn">×</button>
        `;
    container.insertBefore(newBenefit, container.lastElementChild);
  });

  // Add Criteria handler
  document.querySelector(".add-criteria-btn")?.addEventListener("click", () => {
    const container = document.getElementById("eligibilityCriteria");
    const newCriteria = document.createElement("div");
    newCriteria.className = "criteria-item";
    newCriteria.dataset.new = "true";
    newCriteria.innerHTML = `
            <input type="text" class="form-control" placeholder="Enter criteria">
            <button type="button" class="remove-btn">×</button>
        `;
    container.insertBefore(newCriteria, container.lastElementChild);
  });

  // Add FAQ handler
  document.querySelector(".add-faq-btn")?.addEventListener("click", () => {
    const container = document.getElementById("faqItems");
    const newFAQ = document.createElement("div");
    newFAQ.className = "faq-item";
    newFAQ.dataset.new = "true";
    newFAQ.innerHTML = `
            <input type="text" class="form-control faq-question" placeholder="Enter question">
            <textarea class="form-control faq-answer" placeholder="Enter answer"></textarea>
            <button type="button" class="remove-btn">×</button>
        `;
    container.insertBefore(newFAQ, container.lastElementChild);
  });

  // Add What's Included handler
  document.querySelector(".add-included-btn")?.addEventListener("click", () => {
    const container = document.getElementById("whatsIncluded");
    const newIncluded = document.createElement("div");
    newIncluded.className = "included-item";
    newIncluded.dataset.new = "true";
    newIncluded.innerHTML = `
            <div class="form-group">
                <label>Title</label>
                <input type="text" class="form-control included-title" placeholder="Enter title">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control included-description" placeholder="Enter description"></textarea>
            </div>
            <button type="button" class="remove-btn">×</button>
        `;
    container.insertBefore(newIncluded, container.lastElementChild);
  });

  // Add Review handler
  document.querySelector(".add-review-btn")?.addEventListener("click", () => {
    const container = document.getElementById("reviews");
    const newReview = document.createElement("div");
    newReview.className = "review-item";
    newReview.dataset.new = "true";
    newReview.innerHTML = `
            <div class="form-group">
                <label>User Name</label>
                <input type="text" class="form-control review-username" placeholder="Enter user name">
            </div>
            <div class="form-group">
                <label>Rating</label>
                <input type="number" min="1" max="5" class="form-control review-rating" value="5">
            </div>
            <div class="form-group">
                <label>Comment</label>
                <textarea class="form-control review-comment" placeholder="Enter comment"></textarea>
            </div>
            <div class="form-group">
                <label>Date</label>
                <input type="date" class="form-control review-date" value="${
                  new Date().toISOString().split("T")[0]
                }">
            </div>
            <button type="button" class="remove-btn">×</button>
        `;
    container.insertBefore(newReview, container.lastElementChild);
  });

  // Setup remove buttons
  document.querySelectorAll(".remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      btn.closest('[class$="-item"]').remove();
    });
  });
}

// Add click handler for new deal button
document.getElementById("addDealBtn")?.addEventListener("click", () => {
  loadNewDealForm();
});

// Initialize deals list and setup submenu toggle when page loads
document.addEventListener("DOMContentLoaded", () => {
  // Setup submenu toggle
  const submenuTrigger = document.querySelector(".has-submenu > a");
  const submenuContainer = document.querySelector(".has-submenu");
  const submenu = document.querySelector(".submenu");

  if (submenuTrigger && submenuContainer && submenu) {
    submenuTrigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();

      // Toggle active state
      submenuContainer.classList.toggle("active");

      // Get the arrow element
      const arrow = submenuTrigger.querySelector(".submenu-arrow");

      // Toggle submenu visibility with animation
      if (submenuContainer.classList.contains("active")) {
        submenu.style.maxHeight = submenu.scrollHeight + "px";
        if (arrow) {
          arrow.style.transform = "rotate(180deg)";
        }
      } else {
        submenu.style.maxHeight = "0px";
        if (arrow) {
          arrow.style.transform = "rotate(0deg)";
        }
      }
    });
  }

  // Initial fetch of deals
  fetchDeals();
});

// Load new deal form
function loadNewDealForm() {
  const contentBody = document.querySelector(".content-body");

  // First clear the content
  contentBody.innerHTML = `
        <div class="form-section">
            <div class="form-section-header">
                <h2>Create New Deal</h2>
            </div>
            <div class="form-section-body">
                <div class="form-row">
                    <div class="form-group">
                        <label>Name</label>
                        <div class="input-with-button">
                            <input type="text" id="dealName" class="form-control" placeholder="Enter deal name">
                            <button type="button" id="generateBtn" class="btn btn-secondary" disabled>
                                <i class="fas fa-magic"></i> Generate Content
                            </button>
                        </div>
                    </div>
                    <div class="form-group">
                        <label>Description</label>
                        <textarea id="dealDescription" class="form-control" placeholder="Enter deal description"></textarea>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-section-header">
                        <h2>Pricing Details</h2>
                    </div>
                    <div class="form-section-body">
                        <div class="form-row">
                            <div class="form-group">
                                <label>Original Price</label>
                                <input type="number" id="originalPrice" class="form-control" placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label>Discounted Price</label>
                                <input type="number" id="discountedPrice" class="form-control" placeholder="0.00">
                            </div>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-section-header">
                        <h2>Detailed Description</h2>
                    </div>
                    <div class="form-section-body" id="detailedDescriptions">
                        <div class="detailed-desc-item">
                            <div class="form-group">
                                <label>Title</label>
                                <input type="text" class="form-control desc-title">
                            </div>
                            <div class="form-group">
                                <label>Content</label>
                                <textarea class="form-control desc-content"></textarea>
                            </div>
                        </div>
                        <button type="button" class="btn btn-secondary" onclick="addDetailedDescription()">+ Add Description</button>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-section-header">
                        <h2>Use Cases</h2>
                    </div>
                    <div class="form-section-body" id="useCases">
                        <div class="use-case-item">
                            <div class="form-group">
                                <label>Use Case</label>
                                <input type="text" class="form-control">
                            </div>
                        </div>
                        <button type="button" class="btn btn-secondary" onclick="addUseCase()">+ Add Use Case</button>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-section-header">
                        <h2>Key Benefits</h2>
                    </div>
                    <div class="form-section-body" id="keyBenefits">
                        <div class="benefit-item">
                            <div class="form-group">
                                <label>Title</label>
                                <input type="text" class="form-control benefit-title">
                            </div>
                            <div class="form-group">
                                <label>Content</label>
                                <textarea class="form-control benefit-content"></textarea>
                            </div>
                        </div>
                        <button type="button" class="btn btn-secondary" onclick="addBenefit()">+ Add Benefit</button>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-section-header">
                        <h2>Eligibility Criteria</h2>
                    </div>
                    <div class="form-section-body" id="eligibilityCriteria">
                        <div class="criteria-item">
                            <div class="form-group">
                                <label>Criteria</label>
                                <input type="text" class="form-control">
                            </div>
                        </div>
                        <button type="button" class="btn btn-secondary" onclick="addCriteria()">+ Add Criteria</button>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-section-header">
                        <h2>FAQ</h2>
                    </div>
                    <div class="form-section-body" id="faqItems">
                        <div class="faq-item">
                            <div class="form-group">
                                <label>Question</label>
                                <input type="text" class="form-control faq-question">
                            </div>
                            <div class="form-group">
                                <label>Answer</label>
                                <textarea class="form-control faq-answer"></textarea>
                            </div>
                        </div>
                        <button type="button" class="btn btn-secondary" onclick="addFAQ()">+ Add FAQ</button>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-section-header">
                        <h2>What's Included</h2>
                    </div>
                    <div class="form-section-body" id="whatsIncluded">
                        <div class="included-item">
                            <div class="form-group">
                                <label>Title</label>
                                <input type="text" class="form-control included-title">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-control included-description"></textarea>
                            </div>
                            <button type="button" class="btn btn-secondary" onclick="addIncludedItem()">+ Add Item</button>
                        </div>
                    </div>
                </div>

                <div class="form-section">
                    <div class="form-section-header">
                        <h2>Reviews</h2>
                    </div>
                    <div class="form-section-body" id="reviews">
                        <div class="review-item">
                            <div class="form-group">
                                <label>User Name</label>
                                <input type="text" class="form-control review-username">
                            </div>
                            <div class="form-group">
                                <label>Rating</label>
                                <input type="number" min="1" max="5" class="form-control review-rating" value="5">
                            </div>
                            <div class="form-group">
                                <label>Comment</label>
                                <textarea class="form-control review-comment"></textarea>
                            </div>
                            <div class="form-group">
                                <label>Date</label>
                                <input type="date" class="form-control review-date" value="${
                                  new Date().toISOString().split("T")[0]
                                }">
                            </div>
                            <button type="button" class="btn btn-secondary" onclick="addReview()">+ Add Review</button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" onclick="cancelNewDeal()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="saveNewDeal()">Save Deal</button>
            </div>
        </div>
    `;

  // Initialize form event listeners
  const dealNameInput = document.getElementById("dealName");
  const generateButton = document.getElementById("generateBtn");

  if (dealNameInput && generateButton) {
    // Add input event listener
    dealNameInput.addEventListener("input", validateGenerateButton);

    // Add click event listener
    generateButton.addEventListener("click", generateDealContent);

    // Initial validation
    validateGenerateButton();
  }
}

// Helper functions for adding form items
function addDetailedDescription() {
  const container = document.getElementById("detailedDescriptions");
  const newDesc = document.createElement("div");
  newDesc.className = "detailed-desc-item";
  newDesc.innerHTML = `
        <div class="form-group">
            <label>Title</label>
            <input type="text" class="form-control desc-title">
        </div>
        <div class="form-group">
            <label>Content</label>
            <textarea class="form-control desc-content"></textarea>
        </div>
        <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
  container.insertBefore(newDesc, container.lastElementChild);
}

function addUseCase() {
  const container = document.getElementById("useCases");
  const newUseCase = document.createElement("div");
  newUseCase.className = "use-case-item";
  newUseCase.innerHTML = `
        <div class="form-group">
            <label>Use Case</label>
            <input type="text" class="form-control">
        </div>
        <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
  container.insertBefore(newUseCase, container.lastElementChild);
}

function addBenefit() {
  const container = document.getElementById("keyBenefits");
  const newBenefit = document.createElement("div");
  newBenefit.className = "benefit-item";
  newBenefit.innerHTML = `
        <div class="form-group">
            <label>Title</label>
            <input type="text" class="form-control benefit-title">
        </div>
        <div class="form-group">
            <label>Content</label>
            <textarea class="form-control benefit-content"></textarea>
        </div>
        <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
  container.insertBefore(newBenefit, container.lastElementChild);
}

function addCriteria() {
  const container = document.getElementById("eligibilityCriteria");
  const newCriteria = document.createElement("div");
  newCriteria.className = "criteria-item";
  newCriteria.innerHTML = `
        <div class="form-group">
            <label>Criteria</label>
            <input type="text" class="form-control">
        </div>
        <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
  container.insertBefore(newCriteria, container.lastElementChild);
}

function addFAQ() {
  const container = document.getElementById("faqItems");
  const newFAQ = document.createElement("div");
  newFAQ.className = "faq-item";
  newFAQ.innerHTML = `
        <div class="form-group">
            <label>Question</label>
            <input type="text" class="form-control faq-question">
        </div>
        <div class="form-group">
            <label>Answer</label>
            <textarea class="form-control faq-answer"></textarea>
        </div>
        <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
  container.insertBefore(newFAQ, container.lastElementChild);
}

function addIncludedItem() {
  const container = document.getElementById("whatsIncluded");
  const newIncluded = document.createElement("div");
  newIncluded.className = "included-item";
  newIncluded.innerHTML = `
        <div class="form-group">
            <label>Title</label>
            <input type="text" class="form-control included-title">
        </div>
        <div class="form-group">
            <label>Description</label>
            <textarea class="form-control included-description"></textarea>
        </div>
        <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
  container.insertBefore(newIncluded, container.lastElementChild);
}

function addReview() {
  const container = document.getElementById("reviews");
  const newReview = document.createElement("div");
  newReview.className = "review-item";
  newReview.innerHTML = `
        <div class="form-group">
            <label>User Name</label>
            <input type="text" class="form-control review-username">
        </div>
        <div class="form-group">
            <label>Rating</label>
            <input type="number" min="1" max="5" class="form-control review-rating" value="5">
        </div>
        <div class="form-group">
            <label>Comment</label>
            <textarea class="form-control review-comment"></textarea>
        </div>
        <div class="form-group">
            <label>Date</label>
            <input type="date" class="form-control review-date" value="${
              new Date().toISOString().split("T")[0]
            }">
        </div>
        <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
    `;
  container.insertBefore(newReview, container.lastElementChild);
}

function cancelNewDeal() {
  const contentBody = document.querySelector(".content-body");
  contentBody.innerHTML = `
        <h1>Welcome to Deals Dashboard</h1>
        <p>Select a deal from the sidebar to view its details.</p>
    `;
}

async function saveNewDeal() {
  const dealData = {
    name: document.getElementById("dealName").value,
    description: document.getElementById("dealDescription").value,
    details: [
      {
        originalPrice: parseFloat(
          document.getElementById("originalPrice").value
        ),
        discountedPrice: parseFloat(
          document.getElementById("discountedPrice").value
        ),
        rating: 0,
        numberOfPeopleRedeemed: 0,
      },
    ],
    detailedDescription: Array.from(
      document.querySelectorAll(".detailed-desc-item")
    ).map((item) => ({
      title: item.querySelector(".desc-title").value,
      content: item.querySelector(".desc-content").value,
    })),
    useCases: Array.from(document.querySelectorAll(".use-case-item input")).map(
      (input) => input.value
    ),
    keyBenefits: Array.from(document.querySelectorAll(".benefit-item")).map(
      (item) => ({
        title: item.querySelector(".benefit-title").value,
        content: item.querySelector(".benefit-content").value,
      })
    ),
    eligibilityCriteria: Array.from(
      document.querySelectorAll(".criteria-item input")
    ).map((input) => input.value),
    faq: Array.from(document.querySelectorAll(".faq-item")).map((item) => ({
      question: item.querySelector(".faq-question").value,
      answer: item.querySelector(".faq-answer").value,
    })),
    whatsIncluded: Array.from(document.querySelectorAll(".included-item")).map(
      (item) => ({
        title: item.querySelector(".included-title").value,
        content: item.querySelector(".included-description").value,
      })
    ),
    reviews: Array.from(document.querySelectorAll(".review-item")).map(
      (item) => ({
        userName: item.querySelector(".review-username").value,
        rating: parseInt(item.querySelector(".review-rating").value),
        comment: item.querySelector(".review-comment").value,
        date: item.querySelector(".review-date").value,
      })
    ),
  };

  try {
    const response = await fetch("/api/deals", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dealData),
    });

    const result = await response.json();

    if (response.ok) {
      alert("Deal created successfully!");
      await fetchDeals(); // Refresh the deals list
      cancelNewDeal(); // Return to dashboard
    } else {
      alert("Error creating deal: " + result.error);
    }
  } catch (error) {
    console.error("Error creating deal:", error);
    alert("Error creating deal. Please try again.");
  }
}

// Validate generate button based on deal name
function validateGenerateButton() {
  const dealName = document.getElementById("dealName");
  const generateBtn = document.getElementById("generateBtn");

  if (!dealName || !generateBtn) return;

  const nameValue = dealName.value.trim();

  if (nameValue.length >= 3) {
    // Require at least 3 characters
    generateBtn.disabled = false;
    generateBtn.classList.remove("btn-disabled");
    generateBtn.classList.add("btn-active");
  } else {
    generateBtn.disabled = true;
    generateBtn.classList.add("btn-disabled");
    generateBtn.classList.remove("btn-active");
  }
}

// Function to generate deal content using Gemini API
async function generateDealContent() {
  const generateBtn = document.getElementById("generateBtn");
  if (!generateBtn) return;

  const originalBtnText = generateBtn.innerHTML;
  generateBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating...';
  generateBtn.disabled = true;

  const dealName = document.getElementById("dealName").value.trim();
  if (!dealName) {
    alert("Please enter a deal name first");
    return;
  }

  try {
    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `Generate a detailed product deal for "${dealName}" in the following JSON format with markdown code block:
\`\`\`json
{
  "name": "${dealName}",
  "description": "A compelling description of ${dealName}'s value proposition",
  "originalPrice": number,
  "discountedPrice": number,
  "detailedDescription": [
    {
      "title": "Feature Title",
      "content": "Detailed feature description"
    }
  ],
  "useCases": [
    "Specific use case 1",
    "Specific use case 2"
  ],
  "keyBenefits": [
    {
      "title": "Benefit Title",
      "content": "Detailed benefit description"
    }
  ],
  "eligibilityCriteria": [
    "Criterion 1",
    "Criterion 2"
  ],
  "faq": [
    {
      "question": "Common question about ${dealName}?",
      "answer": "Detailed answer"
    }
  ],
  "whatsIncluded": [
    {
      "title": "Item Title",
      "description": "Detailed item description"
    }
  ],
  "reviews": [
    {
      "userName": "Reviewer Name",
      "rating": 5,
      "comment": "Great product!",
      "date": "2023-10-27"
    }
  ]
}
\`\`\`
Make it realistic, professional, and specifically tailored to ${dealName}'s product category. Include at least 5 items in detailedDescription, useCases, and keyBenefits. Include at least 4 eligibility criteria and 5 FAQ items. Include at least 3 items in whatsIncluded and 2 reviews.`,
            },
          ],
        },
      ],
    };

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDYGuO7Q2LSPUIyuKzlQKLMvj_5ltr6hAU",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(prompt),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to generate content");
    }

    const data = await response.json();
    // Extract the JSON string from the response text
    const jsonString = data.candidates[0].content.parts[0].text
      .replace("```json\n", "") // Remove the opening markdown
      .replace("\n```", ""); // Remove the closing markdown

    const generatedContent = JSON.parse(jsonString);

    // Fill the form with generated content
    document.getElementById("dealName").value = generatedContent.name;
    document.getElementById("dealDescription").value =
      generatedContent.description;
    document.getElementById("originalPrice").value =
      generatedContent.originalPrice.toFixed(2);
    document.getElementById("discountedPrice").value =
      generatedContent.discountedPrice.toFixed(2);

    // Fill detailed descriptions
    const descContainer = document.getElementById("detailedDescriptions");
    descContainer.innerHTML = ""; // Clear existing
    generatedContent.detailedDescription.forEach((desc) => {
      const descItem = document.createElement("div");
      descItem.className = "detailed-desc-item";
      descItem.innerHTML = `
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="form-control desc-title" value="${desc.title}">
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea class="form-control desc-content">${desc.content}</textarea>
                </div>
                <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
            `;
      descContainer.appendChild(descItem);
    });
    descContainer.appendChild(
      createAddButton("Description", "addDetailedDescription()")
    );

    // Fill use cases
    const useCasesContainer = document.getElementById("useCases");
    useCasesContainer.innerHTML = ""; // Clear existing
    generatedContent.useCases.forEach((useCase) => {
      const useCaseItem = document.createElement("div");
      useCaseItem.className = "use-case-item";
      useCaseItem.innerHTML = `
                <div class="form-group">
                    <label>Use Case</label>
                    <input type="text" class="form-control" value="${useCase}">
                </div>
                <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
            `;
      useCasesContainer.appendChild(useCaseItem);
    });
    useCasesContainer.appendChild(createAddButton("Use Case", "addUseCase()"));

    // Fill key benefits
    const benefitsContainer = document.getElementById("keyBenefits");
    benefitsContainer.innerHTML = ""; // Clear existing
    generatedContent.keyBenefits.forEach((benefit) => {
      const benefitItem = document.createElement("div");
      benefitItem.className = "benefit-item";
      benefitItem.innerHTML = `
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="form-control benefit-title" value="${benefit.title}">
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea class="form-control benefit-content">${benefit.content}</textarea>
                </div>
                <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
            `;
      benefitsContainer.appendChild(benefitItem);
    });
    benefitsContainer.appendChild(createAddButton("Benefit", "addBenefit()"));

    // Fill eligibility criteria
    const criteriaContainer = document.getElementById("eligibilityCriteria");
    criteriaContainer.innerHTML = ""; // Clear existing
    generatedContent.eligibilityCriteria.forEach((criteria) => {
      const criteriaItem = document.createElement("div");
      criteriaItem.className = "criteria-item";
      criteriaItem.innerHTML = `
                <div class="form-group">
                    <label>Criteria</label>
                    <input type="text" class="form-control" value="${criteria}">
                </div>
                <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
            `;
      criteriaContainer.appendChild(criteriaItem);
    });
    criteriaContainer.appendChild(createAddButton("Criteria", "addCriteria()"));

    // Fill FAQ
    const faqContainer = document.getElementById("faqItems");
    faqContainer.innerHTML = ""; // Clear existing
    generatedContent.faq.forEach((faq) => {
      const faqItem = document.createElement("div");
      faqItem.className = "faq-item";
      faqItem.innerHTML = `
                <div class="form-group">
                    <label>Question</label>
                    <input type="text" class="form-control faq-question" value="${faq.question}">
                </div>
                <div class="form-group">
                    <label>Answer</label>
                    <textarea class="form-control faq-answer">${faq.answer}</textarea>
                </div>
                <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
            `;
      faqContainer.appendChild(faqItem);
    });
    faqContainer.appendChild(createAddButton("FAQ", "addFAQ()"));

    // Fill What's Included
    const includedContainer = document.getElementById("whatsIncluded");
    includedContainer.innerHTML = ""; // Clear existing
    generatedContent.whatsIncluded.forEach((item) => {
      const includedItem = document.createElement("div");
      includedItem.className = "included-item";
      includedItem.innerHTML = `
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="form-control included-title" value="${item.title}">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-control included-description">${item.description}</textarea>
                </div>
                <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
            `;
      includedContainer.appendChild(includedItem);
    });
    includedContainer.appendChild(createAddButton("Item", "addIncludedItem()"));

    // Fill Reviews
    const reviewsContainer = document.getElementById("reviews");
    reviewsContainer.innerHTML = ""; // Clear existing
    generatedContent.reviews.forEach((review) => {
      const reviewItem = document.createElement("div");
      reviewItem.className = "review-item";
      reviewItem.innerHTML = `
                <div class="form-group">
                    <label>User Name</label>
                    <input type="text" class="form-control review-username" value="${review.userName}">
                </div>
                <div class="form-group">
                    <label>Rating</label>
                    <input type="number" min="1" max="5" class="form-control review-rating" value="${review.rating}">
                </div>
                <div class="form-group">
                    <label>Comment</label>
                    <textarea class="form-control review-comment">${review.comment}</textarea>
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" class="form-control review-date" value="${review.date}">
                </div>
                <button type="button" class="btn btn-secondary remove-btn" onclick="this.parentElement.remove()">Remove</button>
            `;
      reviewsContainer.appendChild(reviewItem);
    });
    reviewsContainer.appendChild(createAddButton("Review", "addReview()"));
  } catch (error) {
    console.error("Error generating content:", error);
    let errorMessage = "Failed to generate content. ";
    if (error instanceof SyntaxError) {
      errorMessage += "Invalid response format from the API.";
    } else if (error.message.includes("fetch")) {
      errorMessage += "Network error. Please check your connection.";
    } else {
      errorMessage += "Please try again.";
    }
    alert(errorMessage);
  } finally {
    if (generateBtn) {
      generateBtn.innerHTML = originalBtnText;
      validateGenerateButton(); // This will set the correct disabled state
    }
  }
}

// Helper function to create add buttons
function createAddButton(label, onclick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn btn-secondary";
  button.setAttribute("onclick", onclick);
  button.innerHTML = `+ Add ${label}`;
  return button;
}

function setupDetailedDescriptionHandlers() {
  const container = document.getElementById("detailedDescriptions");
  if (!container) return;

  const addBtn = container.querySelector(".add-desc-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const newItem = document.createElement("div");
      newItem.className = "detailed-desc-item";
      newItem.innerHTML = `
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="form-control desc-title">
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea class="form-control desc-content"></textarea>
                </div>
                <button type="button" class="remove-btn">×</button>
            `;

      addBtn.parentElement.insertBefore(newItem, addBtn);
      const removeBtn = newItem.querySelector(".remove-btn");
      removeBtn.addEventListener("click", () => newItem.remove());
    });
  }

  container
    .querySelectorAll(".detailed-desc-item .remove-btn")
    .forEach((btn) => {
      btn.addEventListener("click", () =>
        btn.closest(".detailed-desc-item").remove()
      );
    });
}

function setupUseCaseHandlers() {
  const container = document.getElementById("useCases");
  if (!container) return;

  const addBtn = container.querySelector(".add-usecase-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const newItem = document.createElement("div");
      newItem.className = "use-case-item";
      newItem.innerHTML = `
                <input type="text" class="form-control">
                <button type="button" class="remove-btn">×</button>
            `;

      addBtn.parentElement.insertBefore(newItem, addBtn);
      const removeBtn = newItem.querySelector(".remove-btn");
      removeBtn.addEventListener("click", () => newItem.remove());
    });
  }

  container.querySelectorAll(".use-case-item .remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest(".use-case-item").remove());
  });
}

function setupBenefitHandlers() {
  const container = document.getElementById("keyBenefits");
  if (!container) return;

  const addBtn = container.querySelector(".add-benefit-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const newItem = document.createElement("div");
      newItem.className = "benefit-item";
      newItem.innerHTML = `
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" class="form-control benefit-title">
                </div>
                <div class="form-group">
                    <label>Content</label>
                    <textarea class="form-control benefit-content"></textarea>
                </div>
                <button type="button" class="remove-btn">×</button>
            `;

      addBtn.parentElement.insertBefore(newItem, addBtn);
      const removeBtn = newItem.querySelector(".remove-btn");
      removeBtn.addEventListener("click", () => newItem.remove());
    });
  }

  container.querySelectorAll(".benefit-item .remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest(".benefit-item").remove());
  });
}

function setupCriteriaHandlers() {
  const container = document.getElementById("eligibilityCriteria");
  if (!container) return;

  const addBtn = container.querySelector(".add-criteria-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const newItem = document.createElement("div");
      newItem.className = "criteria-item";
      newItem.innerHTML = `
                <input type="text" class="form-control">
                <button type="button" class="remove-btn">×</button>
            `;

      addBtn.parentElement.insertBefore(newItem, addBtn);
      const removeBtn = newItem.querySelector(".remove-btn");
      removeBtn.addEventListener("click", () => newItem.remove());
    });
  }

  container.querySelectorAll(".criteria-item .remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest(".criteria-item").remove());
  });
}

function setupFAQHandlers() {
  const container = document.getElementById("faqItems");
  if (!container) return;

  const addBtn = container.querySelector(".add-faq-btn");
  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const newItem = document.createElement("div");
      newItem.className = "faq-item";
      newItem.innerHTML = `
                <div class="form-group">
                    <label>Question</label>
                    <input type="text" class="form-control faq-question">
                </div>
                <div class="form-group">
                    <label>Answer</label>
                    <textarea class="form-control faq-answer"></textarea>
                </div>
                <button type="button" class="remove-btn">×</button>
            `;

      addBtn.parentElement.insertBefore(newItem, addBtn);
      const removeBtn = newItem.querySelector(".remove-btn");
      removeBtn.addEventListener("click", () => newItem.remove());
    });
  }

  container.querySelectorAll(".faq-item .remove-btn").forEach((btn) => {
    btn.addEventListener("click", () => btn.closest(".faq-item").remove());
  });
}

// Setup section save handlers
function setupSectionSaveHandlers() {
  const form = document.querySelector(".deal-form");
  if (!form) return;

  form.querySelectorAll(".save-section-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const section = btn.dataset.section;
      const sectionData = {};

      switch (section) {
        case "basicInfo":
          sectionData.name = document.getElementById("dealName").value;
          sectionData.description =
            document.getElementById("dealDescription").value;
          break;
        case "details":
          sectionData.details = [
            {
              originalPrice: parseFloat(
                document.getElementById("originalPrice").value
              ),
              discountedPrice: parseFloat(
                document.getElementById("discountedPrice").value
              ),
            },
          ];
          break;
        case "detailedDescription":
          sectionData.detailedDescription = Array.from(
            document.querySelectorAll(".detailed-desc-item")
          ).map((item) => ({
            title: item.querySelector(".desc-title").value,
            content: item.querySelector(".desc-content").value,
          }));
          break;
        case "whatsIncluded":
          sectionData.whatsIncluded = Array.from(
            document.querySelectorAll(".included-item")
          ).map((item) => ({
            title: item.querySelector(".included-title").value,
            description: item.querySelector(".included-description").value,
          }));
          break;
        case "reviews":
          sectionData.reviews = Array.from(
            document.querySelectorAll(".review-item")
          ).map((item) => ({
            userName: item.querySelector(".review-username").value,
            rating: parseInt(item.querySelector(".review-rating").value),
            comment: item.querySelector(".review-comment").value,
            date: item.querySelector(".review-date").value,
          }));
          break;
        case "useCases":
          sectionData.useCases = Array.from(
            document.querySelectorAll(".use-case-item input")
          ).map((input) => input.value);
          break;
        case "keyBenefits":
          sectionData.keyBenefits = Array.from(
            document.querySelectorAll(".benefit-item")
          ).map((item) => ({
            title: item.querySelector(".benefit-title").value,
            content: item.querySelector(".benefit-content").value,
          }));
          break;
        case "eligibilityCriteria":
          sectionData.eligibilityCriteria = Array.from(
            document.querySelectorAll(".criteria-item input")
          ).map((input) => input.value);
          break;
        case "faq":
          sectionData.faq = Array.from(
            document.querySelectorAll(".faq-item")
          ).map((item) => ({
            question: item.querySelector(".faq-question").value,
            answer: item.querySelector(".faq-answer").value,
          }));
          break;
      }

      try {
        const response = await fetch(`/api/deals/${currentDealId}/${section}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(sectionData),
        });

        const result = await response.json();
        if (response.ok) {
          showNotification(`${section} updated successfully`, "success");
        } else {
          showNotification(
            `Error updating ${section}: ${result.error}`,
            "error"
          );
        }
      } catch (error) {
        console.error(`Error updating ${section}:`, error);
        showNotification(`Error updating ${section}`, "error");
      }
    });
  });
}

// Function to create a deal card
function createDealCard(deal) {
    const details = deal.details?.[0] || {};
    return `
        <div class="deal-card" data-deal-id="${deal._id}">
            <img src="${deal.imageUrl}" class="logo" alt="${deal.name}">
            <div class="deal-name">${deal.name}</div>
            <div class="deal-description">${deal.description}</div>
            <div class="deal-price">
                ${details.originalPrice ? `
                    <span class="original-price">$${details.originalPrice}</span>
                    <span class="discounted-price">$${details.discountedPrice}</span>
                ` : ''}
            </div>
            <div class="deal-actions">
                <span class="status-badge ${deal.recent ? 'recent' : ''}">
                    ${deal.recent ? 'Recent' : ''}
                </span>
                <span class="status-badge ${deal.trending ? 'trending' : ''}">
                    ${deal.trending ? 'Trending' : ''}
                </span>
                <span class="status-badge ${deal.popular ? 'popular' : ''}">
                    ${deal.popular ? 'Popular' : ''}
                </span>
            </div>
        </div>
    `;
}

// Function to render deals in the grid
function renderDealsInDashboard(deals) {
  const contentBody = document.querySelector(".content-body");
  contentBody.innerHTML = "";

  const gridContainer = document.createElement("div");
  gridContainer.classList.add("dashboard-grid");
  const h1 = document.createElement('h1')
  h1.textContent = 'Welcome to Deals Dashboard'
  contentBody.appendChild(h1)
  const p = document.createElement('p')
  p.textContent = 'Manage and update your deals below.'
  contentBody.appendChild(p)
  contentBody.appendChild(gridContainer);
  console.log("Rendering deals in dashboard", gridContainer);

  // Remove loading state if it exists
  const loadingState = gridContainer.querySelector(".loading-state");
  if (loadingState) {
    loadingState.remove();
  }

  // Render the deals
  const dealsHTML = deals.map((deal) => createDealCard(deal)).join("");
  gridContainer.innerHTML = dealsHTML;

  // If no deals were found, show a message
  if (!deals.length) {
    gridContainer.innerHTML = `
            <div class="no-deals-state" style="grid-column: 1 / -1; text-align: center; padding: 40px;">
                <p>No deals available. Click "Add New Deal" to create one.</p>
            </div>
        `;
  }

  // Add click event listeners to cards
  gridContainer.querySelectorAll(".deal-card").forEach((card) => {
    card.addEventListener("click", () => {
      const dealId = card.dataset.dealId;
      loadDealDetails(dealId);
    });
  });

  // Also populate the submenu with deals
  const submenu = document.querySelector(".submenu");
  if (submenu) {
    submenu.innerHTML = deals
      .map(
        (deal) => `
            <li data-deal-id="${deal._id}">
                <a href="#">${deal.name}</a>
            </li>
        `
      )
      .join("");

    // Add click handlers to submenu items
    submenu.querySelectorAll("li").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault();
        const dealId = item.dataset.dealId;
        loadDealDetails(dealId);
      });
    });
  }
}

// Function to load and render deals
async function loadAndRenderDeals() {
    try {
        const response = await fetch("/api/deals", {
            credentials: 'include'
        });
        if (!response.ok) throw new Error("Failed to fetch deals");

        const result = await response.json();
        const deals = result.success && Array.isArray(result.data) ? result.data : [];

        const contentBody = document.querySelector(".content-body");
        contentBody.innerHTML = `
            <div class="dashboard-header">
                <h1>Welcome to Deals Dashboard</h1>
                <p>Manage and update your deals below.</p>
            </div>
            <div class="dashboard-grid">
                ${deals.map(deal => `
                    <div class="deal-card" data-deal-id="${deal._id}">
                        <div class="deal-image">
                            <img src="${deal.imageUrl || ''}" alt="${deal.name}" onerror="this.src='../public/placeholder.png'">
                        </div>
                        <div class="deal-content">
                            <h3 class="deal-name">${deal.name}</h3>
                            <p class="deal-description">${deal.description || ''}</p>
                            ${deal.details?.[0] ? `
                                <div class="deal-pricing">
                                    <span class="original-price">$${deal.details[0].originalPrice}</span>
                                    <span class="discounted-price">$${deal.details[0].discountedPrice}</span>
                                </div>
                            ` : ''}
                            <div class="deal-badges">
                                ${deal.recent ? '<span class="badge recent">Recent</span>' : ''}
                                ${deal.trending ? '<span class="badge trending">Trending</span>' : ''}
                                ${deal.popular ? '<span class="badge popular">Popular</span>' : ''}
                            </div>
                        </div>
                    </div>
                `).join('') || `
                    <div class="no-deals">
                        <p>No deals available. Click "Add New Deal" to create one.</p>
                    </div>
                `}
            </div>
        `;

        // Add click handlers to deal cards
        document.querySelectorAll('.deal-card').forEach(card => {
            card.addEventListener('click', () => {
                const dealId = card.dataset.dealId;
                loadDealDetails(dealId);
            });
        });

    } catch (error) {
        console.error("Error loading deals:", error);
        document.querySelector(".content-body").innerHTML = `
            <div class="error-state">
                <p>Failed to load deals. Please try again later.</p>
            </div>
        `;
    }
}

// Function to load deal details
async function loadDealDetails(deal) {
    try {
        let dealData = deal;

        // If we only have the ID, fetch the full deal data
        if (typeof deal === "string" || (deal && !deal.details)) {
            const dealId = typeof deal === "string" ? deal : deal._id;
            const response = await fetch(`/api/deals/${dealId}`, {
                credentials: 'include'
            });
            dealData = await response.json();
            if (!dealData.success && !dealData.details) {
                throw new Error("Failed to fetch deal details");
            }
            dealData = dealData.success ? dealData.data : dealData;
        }

        const contentBody = document.querySelector(".content-body");
        if (contentBody) {
            contentBody.innerHTML = `
                <div class="deal-header">
                    <h1>${dealData.name}</h1>
                    <div class="deal-actions">
                        <button class="edit-deal-btn">
                            <i class="fas fa-edit"></i> Edit Deal
                        </button>
                        <button class="save-deal-btn" style="display: none;">
                            <i class="fas fa-save"></i> Save All
                        </button>
                        <button class="cancel-edit-btn" style="display: none;">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
                <div class="deal-form">
                <div class="form-section">
                    <div style="display: flex; justify-content: space-between; align-items: center;" class="form-section-header">
                            <h2>Basic Information</h2>
                            <div class="status-toggles">
                                   <button class="status-toggle ${deal.recent ? 'active' : ''}" data-status="recent">
                                       <i class="fas fa-clock"></i> Recent
                                   </button>
                                   <button class="status-toggle ${deal.trending ? 'active' : ''}" data-status="trending">
                                       <i class="fas fa-chart-line"></i> Trending
                                   </button>
                                   <button class="status-toggle ${deal.popular ? 'active' : ''}" data-status="popular">
                                       <i class="fas fa-fire"></i> Popular
                                   </button>
                               </div>
                    </div>
                    <div class="form-section-body">
                            <div class="form-group">
                                <label>Name</label>
                                <input type="text" class="form-control" value="${dealData.name}" readonly data-original="${dealData.name}">
                            </div>
                            <div class="form-group">
                                <label>Description</label>
                                <textarea class="form-control" readonly data-original="${dealData.description || ""}">${dealData.description || ""}</textarea>
                            </div>
                            <div class="form-group">
                                <label>Deal Image</label>
                                <div class="image-upload-container">
                                    <input type="file" class="form-control" id="dealImage" accept="image/*" disabled data-original-url="${dealData.imageUrl || ""}">
                                    <div class="image-preview">
                                        ${dealData.imageUrl ? `<img src="${dealData.imageUrl}" alt="Deal image">` : '<div class="no-image">No image uploaded</div>'}
                                    </div>
                                </div>
                            </div>
                            </div>
                        </div>

                        <div class="form-section">
                            <div class="form-section-header">
                                <h2>Pricing Details</h2>
                            </div>
                            <div class="form-section-body">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Original Price</label>
                                        <input type="number" step="0.01" class="form-control" value="${dealData.details?.[0]?.originalPrice || 0}" readonly data-original="${dealData.details?.[0]?.originalPrice || 0}">
                                    </div>
                                    <div class="form-group">
                                        <label>Discounted Price</label>
                                        <input type="number" step="0.01" class="form-control" value="${dealData.details?.[0]?.discountedPrice || 0}" readonly data-original="${dealData.details?.[0]?.discountedPrice || 0}">
                                    </div>
                                </div>
                            </div>
                        </div>

                    ${dealData.detailedDescription?.length ? `
                        <div class="form-section">
                            <div class="form-section-header">
                            <h2>Detailed Description</h2>
                            </div>
                        <div class="form-section-body" id="detailedDescriptions">
                            ${dealData.detailedDescription.map((desc, index) => `
                                <div class="description-item" data-index="${index}">
                                    <input type="text" class="form-control desc-title" value="${desc.title}" readonly data-original="${desc.title}">
                                    <textarea class="form-control desc-content" readonly data-original="${desc.content}">${desc.content}</textarea>
                                    <button type="button" class="remove-btn" style="display: none;">×</button>
                                    </div>
                                `).join("")}
                            <button type="button" class="add-desc-btn" style="display: none;">+ Add Description</button>
                            </div>
                    </div>` : ""}

                    ${dealData.useCases?.length ? `
                        <div class="form-section">
                            <div class="form-section-header">
                                <h2>Use Cases</h2>
                            </div>
                        <div class="form-section-body" id="useCases">
                            ${dealData.useCases.map((useCase, index) => `
                                <div class="use-case-item" data-index="${index}">
                                    <input type="text" class="form-control" value="${useCase}" readonly data-original="${useCase}">
                                    <button type="button" class="remove-btn" style="display: none;">×</button>
                                </div>
                                    `).join("")}
                            <button type="button" class="add-usecase-btn" style="display: none;">+ Add Use Case</button>
                            </div>
                    </div>` : ""}

                    ${dealData.keyBenefits?.length ? `
                        <div class="form-section">
                            <div class="form-section-header">
                                <h2>Key Benefits</h2>
                            </div>
                        <div class="form-section-body" id="keyBenefits">
                            ${dealData.keyBenefits.map((benefit, index) => `
                                <div class="benefit-item" data-index="${index}">
                                    <input type="text" class="form-control benefit-title" value="${benefit.title}" readonly data-original="${benefit.title}">
                                    <textarea class="form-control benefit-content" readonly data-original="${benefit.content}">${benefit.content}</textarea>
                                    <button type="button" class="remove-btn" style="display: none;">×</button>
                                    </div>
                                `).join("")}
                            <button type="button" class="add-benefit-btn" style="display: none;">+ Add Benefit</button>
                            </div>
                    </div>` : ""}

                    ${dealData.eligibilityCriteria?.length ? `
                        <div class="form-section">
                            <div class="form-section-header">
                                <h2>Eligibility Criteria</h2>
                            </div>
                        <div class="form-section-body" id="eligibilityCriteria">
                            ${dealData.eligibilityCriteria.map((criteria, index) => `
                                <div class="criteria-item" data-index="${index}">
                                    <input type="text" class="form-control" value="${criteria}" readonly data-original="${criteria}">
                                    <button type="button" class="remove-btn" style="display: none;">×</button>
                                </div>
                                    `).join("")}
                            <button type="button" class="add-criteria-btn" style="display: none;">+ Add Criteria</button>
                            </div>
                    </div>` : ""}

                    ${dealData.faq?.length ? `
                        <div class="form-section">
                            <div class="form-section-header">
                                <h2>FAQ</h2>
                            </div>
                        <div class="form-section-body" id="faqItems">
                            ${dealData.faq.map((item, index) => `
                                <div class="faq-item" data-index="${index}">
                                    <input type="text" class="form-control faq-question" value="${item.question}" readonly data-original="${item.question}">
                                    <textarea class="form-control faq-answer" readonly data-original="${item.answer}">${item.answer}</textarea>
                                    <button type="button" class="remove-btn" style="display: none;">×</button>
                                    </div>
                                `).join("")}
                            <button type="button" class="add-faq-btn" style="display: none;">+ Add FAQ</button>
                            </div>
                    </div>` : ""}

                    ${dealData.whatsIncluded?.length ? `
                        <div class="form-section">
                            <div class="form-section-header">
                                <h2>What's Included</h2>
                            </div>
                        <div class="form-section-body" id="whatsIncluded">
                            ${dealData.whatsIncluded.map((item, index) => `
                                <div class="included-item" data-index="${index}">
                                    <input type="text" class="form-control included-title" value="${item.title}" readonly data-original="${item.title}">
                                    <textarea class="form-control included-description" readonly data-original="${item.content}">${item.content}</textarea>
                                    <button type="button" class="remove-btn" style="display: none;">×</button>
                                    </div>
                                `).join("")}
                            <button type="button" class="add-included-btn" style="display: none;">+ Add Item</button>
                            </div>
                    </div>` : ""}

                    ${dealData.reviews?.length ? `
                        <div class="form-section">
                            <div class="form-section-header">
                                <h2>Reviews</h2>
                            </div>
                        <div class="form-section-body" id="reviews">
                            ${dealData.reviews.map((review, index) => `
                                <div class="review-item" data-index="${index}">
                                    <input type="text" class="form-control review-username" value="${review.userName}" readonly data-original="${review.userName}">
                                    <input type="number" min="1" max="5" class="form-control review-rating" value="${review.rating}" readonly data-original="${review.rating}">
                                    <textarea class="form-control review-comment" readonly data-original="${review.comment}">${review.comment}</textarea>
                                    <input type="date" class="form-control review-date" value="${review.date}" readonly data-original="${review.date}">
                                    <button type="button" class="remove-btn" style="display: none;">×</button>
                                    </div>
                                `).join("")}
                            <button type="button" class="add-review-btn" style="display: none;">+ Add Review</button>
                            </div>
                    </div>` : ""}
                </div>
            `;

            // Add event handlers
            setupDealEventHandlers(dealData);
        }
    } catch (error) {
        console.error("Error loading deal details:", error);
        alert("Error loading deal details. Please try again.");
    }
}
