document.addEventListener("DOMContentLoaded", function () {
  const settingsScreen = document.getElementById("screen-settings");
  if (settingsScreen) {
    const observer = new MutationObserver(function () {
      if (settingsScreen.classList.contains("active")) {
        populateSettings();
      }
    });
    observer.observe(settingsScreen, { attributeFilter: ["class"] });
  }

  function populateSettings() {
    const profile = getProfile();
    const diet = getShotDiet();

    if (profile) {
      setVal("settings-age", profile.age);
      setVal("settings-height", profile.heightInches);
      setVal("settings-weight", profile.weightLbs);
      setSelectVal("settings-skill", profile.skillLevel);
    }

    if (diet) {
      setVal("settings-diet-threes", diet.threes);
      setVal("settings-diet-midrange", diet.midRange);
      setVal("settings-diet-layups", diet.layups);
      setVal("settings-diet-ballhandling", diet.ballHandling);
      updateDietTotal();
    }
  }

  const saveProfileBtn = document.getElementById("btn-save-profile-settings");
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", function () {
      const age = parseInt(document.getElementById("settings-age").value);
      const height = parseInt(document.getElementById("settings-height").value);
      const weight = parseInt(document.getElementById("settings-weight").value);
      const skill = document.getElementById("settings-skill").value;
      const errorEl = document.getElementById("settings-profile-error");

      if (!age || !height || !weight || !skill) {
        showError(errorEl, "Please fill out all fields.");
        return;
      }
      if (age < 10 || age > 60) {
        showError(errorEl, "Age must be between 10 and 60.");
        return;
      }
      if (height < 48 || height > 108) {
        showError(
          errorEl,
          "Please enter a valid height in inches (e.g. 74 for 6'2\").",
        );
        return;
      }
      if (weight < 80 || weight > 400) {
        showError(errorEl, "Enter a valid weight in lbs.");
        return;
      }

      errorEl.style.display = "none";
      saveProfile({
        age,
        heightInches: height,
        weightLbs: weight,
        skillLevel: skill,
      });
      confirmSave(saveProfileBtn, "Save Profile");
    });
  }

  const dietIds = [
    "settings-diet-threes",
    "settings-diet-midrange",
    "settings-diet-layups",
    "settings-diet-ballhandling",
  ];

  dietIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("input", updateDietTotal);
  });

  function updateDietTotal() {
    const total = getTotal(dietIds);
    const display = document.getElementById("settings-diet-total");
    if (display) {
      display.textContent = total + " / 100";
      display.style.color = total === 100 ? "var(--green)" : "var(--orange)";
    }
  }

  const saveDietBtn = document.getElementById("btn-save-diet-settings");
  if (saveDietBtn) {
    saveDietBtn.addEventListener("click", function () {
      const total = getTotal(dietIds);
      const errorEl = document.getElementById("settings-diet-error");

      if (total !== 100) {
        showError(
          errorEl,
          "Percentages must add up to 100. Currently: " + total + "%",
        );
        return;
      }

      errorEl.style.display = "none";
      saveShotDiet({
        threes: getInt("settings-diet-threes"),
        midRange: getInt("settings-diet-midrange"),
        layups: getInt("settings-diet-layups"),
        ballHandling: getInt("settings-diet-ballhandling"),
      });
      confirmSave(saveDietBtn, "Save Shot Diet");
    });
  }

  function getTotal(ids) {
    return ids.reduce((sum, id) => sum + (getInt(id) || 0), 0);
  }
  function getInt(id) {
    return parseInt(document.getElementById(id)?.value) || 0;
  }
  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }
  function setSelectVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }
  function showError(el, msg) {
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
  }
  function confirmSave(btn, originalText) {
    btn.textContent = "Saved ✓";
    setTimeout(() => {
      btn.textContent = originalText;
    }, 2000);
  }
});
