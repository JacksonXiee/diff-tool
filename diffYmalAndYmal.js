const yaml = require("js-yaml");
const fs = require("fs");

const socialYamlRaw = fs.readFileSync("./social.yaml", "utf8");
const social = yaml.load(socialYamlRaw);
const monoYamlRaw = fs.readFileSync("./mono.yaml", "utf8");
const mono = yaml.load(monoYamlRaw);

const monoSocial = mono.importers["apps/social"];

function getVersion(version) {
  try {
    return version.split("_")[0];
  } catch (e) {
    console.log(version, e);
    return version;
  }
}

function diffDeps(a, b) {
  const aDeps = Object.keys(a);
  const bDeps = Object.keys(b);
  const diff = {};
  const add = {};
  aDeps.forEach((dep) => {
    if (!b[dep]) {
      add[dep] = a[dep].version;
    } else {
      const depVersionA = getVersion(a[dep]);
      const depVersionB = getVersion(b[dep]);
      if (depVersionA !== depVersionB) {
        diff[dep] = depVersionA;
      }
    }
  });
  return { diff, add };
}

// 对比 dependencies 变更
const { diff: diffDep, add: addDep } = diffDeps(social.dependencies, monoSocial.dependencies);
fs.writeFileSync("./diffDep.json", JSON.stringify(diffDep, null, 2));
fs.writeFileSync("./addDep.json", JSON.stringify(addDep, null, 2));
// 对比 dev dependencies 变更
const { diff: diffDevDep, add: addDevDep } = diffDeps(social.devDependencies, monoSocial.devDependencies);
fs.writeFileSync("./diffDevDep.json", JSON.stringify(diffDevDep, null, 2));
fs.writeFileSync("./addDevDep.json", JSON.stringify(addDevDep, null, 2));
