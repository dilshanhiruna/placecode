const fs = require("fs");
const path = require("path");

//F1
// Check schema of the feature file
function validateFeatureFile(obj) {
  if (
    typeof obj !== "object" ||
    obj === null ||
    !Array.isArray(obj) ||
    obj.some((category) => typeof category !== "object" || category === null)
  ) {
    return { isValid: false, errorMessage: "Invalid object structure" };
  }

  for (const category of obj) {
    if (
      typeof category.label !== "string" ||
      typeof category.description !== "string" ||
      typeof category.required !== "boolean" ||
      !Array.isArray(category.features) ||
      category.features.some(
        (feature) =>
          typeof feature !== "object" ||
          feature === null ||
          typeof feature.label !== "string" ||
          typeof feature.description !== "string" ||
          !Array.isArray(feature.depend_features) ||
          !Array.isArray(feature.depend_categories) ||
          typeof feature.enabled !== "boolean"
      )
    ) {
      return {
        isValid: false,
        errorMessage: "Invalid feature object structure",
      };
    }
  }

  return { isValid: true };
}

//F2
// Check if all the labels are unique and not empty,
// and do not contain any special characters or spaces
function validateLabels(obj) {
  const labels = new Set();

  function validateLabel(label, path) {
    if (label === "") {
      return { isValid: false, errorMessage: `Empty label found` };
    }

    const trimmedLabel = label.trim();
    if (trimmedLabel !== label) {
      return {
        isValid: false,
        errorMessage: `Label "${label}" contains leading or trailing whitespace`,
        errorPath: path,
      };
    }

    if (!/^[a-zA-Z0-9_.-]+$/.test(trimmedLabel)) {
      return {
        isValid: false,
        errorMessage: `Label "${label}" contains special characters`,
        errorPath: path,
      };
    }

    if (labels.has(trimmedLabel)) {
      return {
        isValid: false,
        errorMessage: `Duplicate label "${label}" found`,
        errorPath: path,
      };
    }

    labels.add(trimmedLabel);
    return { isValid: true };
  }

  for (let i = 0; i < obj.length; i++) {
    const category = obj[i];
    // const categoryPath = `optionsFile[${i}].label`
    const categoryPath = `${category.label}`;

    const categoryLabelResult = validateLabel(category.label, categoryPath);
    if (!categoryLabelResult.isValid) {
      return categoryLabelResult;
    }

    for (let j = 0; j < category.features.length; j++) {
      const feature = category.features[j];
      // const featurePath = `optionsFile[${i}].features[${j}].label`
      const featurePath = `${category.label}.features.${feature.label}`;

      const featureLabelResult = validateLabel(feature.label, featurePath);
      if (!featureLabelResult.isValid) {
        return featureLabelResult;
      }
    }
  }

  return { isValid: true };
}

//F3
// in depend_features array, there can't be feature from the same category
// There can be many depend_features from other categories, but only one from a specific category
// eg: if an feaure has 2 depend feature, the 2 depend feaures can be from two different categories,
// but thoses 2 depend feature can't be from a single category
function validateDependFeatures(data) {
  const categoryMap = {};
  const featureCategoryMap = {};

  // Step 1: Build the category map
  data.forEach((category) => {
    categoryMap[category.label] = category.features;
  });

  // Step 2: Validate depend_features and depend_categories
  for (const category of Object.keys(categoryMap)) {
    const features = categoryMap[category];
    for (const feature of features) {
      const { depend_features, depend_categories } = feature;

      // Check if any feature from the same category is listed in depend_features
      const sameCategoryFeatures = features.map((f) => f.label);
      const sameCategoryFeatureInDepends = depend_features.some((df) =>
        sameCategoryFeatures.includes(df)
      );
      if (sameCategoryFeatureInDepends) {
        return {
          isValid: false,
          errorMessage: `Feature "${feature.label}" in category "${category}" depends on a feature from the same category.`,
          errorPath: `${category}.features.${feature.label}.depend_features`,
        };
      }

      // Check if there are more than one feature from the same category in depend_categories
      const categoryCounts = {};
      for (const dependFeature of depend_features) {
        const dependFeatureCategory = getCategoryForFeature(
          dependFeature,
          categoryMap
        );
        if (dependFeatureCategory === category) {
          continue; // Skip if the dependFeature is from the same category
        }
        if (!categoryCounts[dependFeatureCategory]) {
          categoryCounts[dependFeatureCategory] = 1;
        } else {
          categoryCounts[dependFeatureCategory]++;
        }
      }

      const duplicateCategories = Object.keys(categoryCounts).filter(
        (category) => categoryCounts[category] > 1
      );

      if (duplicateCategories.length > 0) {
        return {
          isValid: false,
          errorMessage: `Feature "${feature.label}" in category "${category}" has multiple features from the same category in its depend_features array.`,
          errorPath: `${category}.features.${feature.label}.depend_features`,
        };
      }
    }
  }

  return { isValid: true };
}

function getCategoryForFeature(featureLabel, categoryMap) {
  for (const category of Object.keys(categoryMap)) {
    const features = categoryMap[category];
    if (features.some((feature) => feature.label === featureLabel)) {
      return category;
    }
  }
  return ""; // Return empty string instead of null
}

//F4
// depend_features and depend_categories must be valid labels that exist in the feature file
function validateDependLabels(data) {
  const allLabels = new Set();

  // Step 1: Collect all labels from categories and features
  data.forEach((category) => {
    allLabels.add(category.label);
    category.features.forEach((feature) => {
      allLabels.add(feature.label);
    });
  });

  // Step 2: Validate depend_features and depend_categories
  for (const category of data) {
    for (const feature of category.features) {
      const { depend_features, depend_categories } = feature;

      // Check if depend_features contains any invalid labels
      for (const dependFeature of depend_features) {
        if (dependFeature.trim() !== "" && !allLabels.has(dependFeature)) {
          return {
            isValid: false,
            errorMessage: `Feature "${feature.label}" in category "${category.label}" has an invalid depend_feature "${dependFeature}"`,
            errorPath: `${category.label}.features.${feature.label}.depend_features`,
          };
        }
      }

      // Check if depend_categories contains any invalid labels
      for (const dependCategory of depend_categories) {
        if (dependCategory.trim() !== "" && !allLabels.has(dependCategory)) {
          return {
            isValid: false,
            errorMessage: `Feature "${feature.label}" in category "${category.label}" has an invalid depend_category "${dependCategory}"`,
            errorPath: `${category.label}.features.${feature.label}.depend_categories`,
          };
        }
      }
    }
  }

  return { isValid: true };
}

//F5
// There can be only one feature enabled per category
function validateSingleFeaturePerCategory(data) {
  const categoryMap = {};

  // Step 1: Build the category map
  data.forEach((category) => {
    categoryMap[category.label] = category.features;
  });

  // Step 2: Validate that only one feature is enabled per category
  for (const category of Object.keys(categoryMap)) {
    const features = categoryMap[category];
    const enabledFeaturesCount = features.reduce(
      (count, feature) => (feature.enabled ? count + 1 : count),
      0
    );

    if (enabledFeaturesCount > 1) {
      return {
        isValid: false,
        errorMessage: `More than one feature is enabled in category "${category}". Only one feature is allowed per category.`,
        errorPath: `${category}`,
      };
    }
  }

  return { isValid: true };
}

//F6
// There should be at least one feature selected from the required category
function validateRequiredFeatures(data) {
  for (const category of data) {
    if (
      category.required &&
      category.features.every((feature) => !feature.enabled)
    ) {
      return {
        isValid: false,
        errorMessage: `At least one feature should be selected from the required category "${category.label}".`,
        errorPath: `${category.label}`,
      };
    }
  }

  return { isValid: true };
}

function runValidations(dir) {
  const placecodeJsonFile = path.join(dir, ".", "placecode.json");
  const content = fs.readFileSync(placecodeJsonFile, "utf8");

  const validations = [
    validateFeatureFile,
    validateLabels,
    validateDependFeatures,
    validateDependLabels,
    validateSingleFeaturePerCategory,
    validateRequiredFeatures,
  ];

  for (const validation of validations) {
    const result = validation(JSON.parse(content));
    if (!result.isValid) {
      return result;
    }
  }

  return { isValid: true };
}

module.exports = runValidations;
