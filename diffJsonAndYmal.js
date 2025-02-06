const yaml = require("js-yaml");
const fs = require("fs");

// 修改旧仓库json
const json = require("./businessCard.json");
const monoYamlRaw = fs.readFileSync("./pnpm-lock.yaml", "utf8");
const mono = yaml.load(monoYamlRaw);
// 修改新仓库yaml
const monoRep = mono.importers["apps/businessCard"];
const depsForMono = [
  ...Object.keys(monoRep.dependencies).map((key) => ({
    name: key,
    version: getVersion(monoRep.dependencies[key])
  })),
  ...Object.keys(monoRep.devDependencies).map((key) => ({
    name: key,
    version: getVersion(monoRep.devDependencies[key]),
  })),
].sort((a,b)=>{
  return a.name-b.name;
});

const depsForJson = Object.keys(json.dependencies).map((key) => {
  return {
    name: key,
    version: getVersion(json.dependencies[key].version)
  };
});
// console.log("depsForMono", depsForMono); 
// console.log("depsForJson", depsForJson);

function getVersion(version) {
  try {
    return version.split("_")[0];
  } catch (e) {
    console.log(version, e);
    return version;
  }
}

function diffDeps(newRep, oldRep) {
  const diff = {};
  const add = {};
  console.log('length',newRep.length,'__',oldRep.length)
  newRep.forEach((dep) => {
    const findDep =  oldRep.find(item=>item.name === dep.name)
    if (!findDep) {
      add[dep.name] = dep.version;
    } else {
      const newVersion = dep.version;
      const oldVersion = findDep.version;
      if (oldVersion !== newVersion) {
        diff[dep.name] = oldVersion;
      }
    }
  });
  return { diff, add };
}

const { diff: diffDep, add: addDep } = diffDeps(
  depsForMono,
  depsForJson
);
// 修改对比文件存储文件夹
fs.writeFileSync("./businessCard/diffDeps.json", JSON.stringify(diffDep, null, 2));
fs.writeFileSync("./businessCard/addDeps.json", JSON.stringify(addDep, null, 2));