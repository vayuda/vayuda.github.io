document.addEventListener("DOMContentLoaded", function () {
  // Existing navigation code
  const navLinks = document.querySelectorAll(".nav-link");
  const contentSections = document.querySelectorAll(".content-section");

  navLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const sectionId = this.getAttribute("data-section");
      if (sectionId === "blog") {
        // Always show blog previews when clicking the blog nav link
        showBlogPreviews();
      }
      navigateToSection(sectionId);
    });
  });

  const readMoreButtons = document.querySelectorAll(".read-more-btn");
  const backButtons = document.querySelectorAll(".back-to-blog");
  const blogPreviews = document.getElementById("blog-previews");
  const blogPosts = document.getElementById("blog-posts");

  readMoreButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const postId = this.getAttribute("data-post-id");
      showBlogPost(postId);
      // Update URL when showing a blog post
      history.pushState({ type: "post", id: postId }, "", `?post=${postId}`);
    });
  });

  backButtons.forEach((button) => {
    button.addEventListener("click", function () {
      showBlogPreviews();
      // Update URL when going back to blog list
      history.pushState({ type: "section", id: "blog" }, "", "?section=blog");
    });
  });

  // Handle browser back/forward buttons
  window.addEventListener("popstate", function (e) {
    if (e.state) {
      if (e.state.type === "post") {
        showBlogPost(e.state.id);
      } else if (e.state.type === "section") {
        navigateToSection(e.state.id);
        if (e.state.id === "blog") {
          showBlogPreviews();
        }
      }
    }
  });

  // Check URL on page load
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has("post")) {
    const postId = urlParams.get("post");
    navigateToSection("blog");
    showBlogPost(postId);
  } else if (urlParams.has("section")) {
    navigateToSection(urlParams.get("section"));
  }

  function navigateToSection(sectionId) {
    // Remove active class from all links
    navLinks.forEach((link) => link.classList.remove("active"));

    // Add active class to corresponding link
    document
      .querySelector(`[data-section="${sectionId}"]`)
      .classList.add("active");

    // Hide all content sections
    contentSections.forEach((section) => {
      section.style.display = "none";
    });

    // Show the selected content section
    const selectedSection = document.getElementById(sectionId);
    selectedSection.style.display = "block";
    setTimeout(() => {
      selectedSection.classList.add("active");
    }, 10);

    // Update URL for section changes
    if (!urlParams.has("post")) {
      history.pushState(
        { type: "section", id: sectionId },
        "",
        `?section=${sectionId}`,
      );
    }
  }

  function showBlogPost(postId) {
    blogPreviews.style.display = "none";
    blogPosts.style.display = "block";
    document.querySelectorAll(".blog-post").forEach((post) => {
      post.style.display = "none";
    });
    document.getElementById("post-" + postId).style.display = "block";
  }

  function showBlogPreviews() {
    blogPosts.style.display = "none";
    blogPreviews.style.display = "block";
  }
});
