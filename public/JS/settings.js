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
      const units = profile.units || "imperial";
      setSelectVal("settings-units", units);
      setVal("settings-age", profile.age);
      setVal(
        "settings-height",
        units === "metric"
          ? inchesToCm(profile.heightInches)
          : profile.heightInches,
      );
      setVal(
        "settings-weight",
        units === "metric" ? lbsToKg(profile.weightLbs) : profile.weightLbs,
      );
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

  const unitsSelect = document.getElementById("settings-units");
  if (unitsSelect) {
    unitsSelect.addEventListener("change", function () {
      const newUnits = this.value;
      const heightInput = document.getElementById("settings-height");
      const weightInput = document.getElementById("settings-weight");

      const currentHeight = parseInt(heightInput.value);
      const currentWeight = parseInt(weightInput.value);

      if (!isNaN(currentHeight)) {
        heightInput.value =
          newUnits === "metric"
            ? inchesToCm(currentHeight)
            : cmToInches(currentHeight);
      }
      if (!isNaN(currentWeight)) {
        weightInput.value =
          newUnits === "metric"
            ? lbsToKg(currentWeight)
            : kgToLbs(currentWeight);
      }
    });
  }

  const saveProfileBtn = document.getElementById("btn-save-profile-settings");
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener("click", function () {
      const age = parseInt(document.getElementById("settings-age").value);
      const skill = document.getElementById("settings-skill").value;
      const units = document.getElementById("settings-units").value;

      let height = parseInt(document.getElementById("settings-height").value);
      let weight = parseInt(document.getElementById("settings-weight").value);

      if (units === "metric") {
        height = cmToInches(height);
        weight = kgToLbs(weight);
      }
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
        showError(errorEl, "Please enter a valid height.");
        return;
      }
      if (weight < 80 || weight > 400) {
        showError(errorEl, "Enter a valid weight.");
        return;
      }
      errorEl.classList.remove("show");
      saveProfile({
        age,
        heightInches: height,
        weightLbs: weight,
        skillLevel: skill,
        units,
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

      errorEl.classList.remove("show");
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
    el.classList.add("show");
    console.log(el.classList);
  }
  function confirmSave(btn, originalText) {
    btn.classList.add("confirmed");
    btn.textContent = "Saved ✓";
    setTimeout(() => {
      btn.classList.remove("confirmed");
      btn.textContent = originalText;
    }, 2000);
  }
});
