const yaml = require("js-yaml");
const fs = require("fs");

const apps = ['apps/businessCard','apps/operation','apps/webapp','apps/webappNew']

const monoYamlRaw = fs.readFileSync("../kuaishou-frontend-ad-social/pnpm-lock.yaml", "utf8");
const mono = yaml.load(monoYamlRaw);

const monoReps = apps.map(app=>mono.importers[app])
const jsons = apps.map(app=>require(`../kuaishou-frontend-ad-social/${app}/package-lock.json`))

for(let i=0;i<monoReps.length;i++){
  const monoRep = monoReps[i];
  const json = jsons[i];

  if(apps[i]==='apps/social'){
    const socialYamlRaw = fs.readFileSync("../kuaishou-frontend-ad-social/apps/social/pnpm-lock.yaml", "utf8");
    const social = yaml.load(socialYamlRaw);

    const depsForMono = [
      ...Object.keys(monoRep.dependencies).map((key) => ({
        name: key,
        version: getVersion(monoRep.dependencies[key])
      })),
      ...Object.keys(monoRep.devDependencies).map((key) => ({
        name: key,
        version: getVersion(monoRep.devDependencies[key]),
      })),
    ]
    const depsForSocial = [
      ...Object.keys(social.dependencies).map((key) => ({
        name: key,
        version: getVersion(social.dependencies[key])
      })),
      ...Object.keys(social.devDependencies).map((key) => ({
        name: key,
        version: getVersion(social.devDependencies[key])
      })),
    ]
    const { diff: diffDeps, add: addDeps } = diffDepsForYmal(depsForMono, depsForSocial);
    writeFile(`./apps/social`,`./apps/social/diffDeps.json`,JSON.stringify(diffDeps, null, 2))
    writeFile(`./apps/social`,`./apps/social/addDeps.json`,JSON.stringify(addDeps, null, 2))
    continue 

  }

  const depsForMono = [
    ...Object.keys(monoRep.dependencies).map((key) => ({
      name: key,
      version: getVersion(monoRep.dependencies[key])
    })),
    ...Object.keys(monoRep.devDependencies).map((key) => ({
      name: key,
      version: getVersion(monoRep.devDependencies[key]),
    })),
  ]
  const depsForJson = Object.keys(json.dependencies).map((key) => {
    return {
      name: key,
      version: getVersion(json.dependencies[key].version)
    };
  });
  // console.log("depsForMono", depsForMono); 
  // console.log("depsForJson", depsForJson);
  
  const { diff: diffDeps, add: addDeps } = diffDepsForJson(
    depsForMono,
    depsForJson
  );
  writeFile(`./${apps[i]}`,`./${apps[i]}/diffDeps.json`,JSON.stringify(diffDeps, null, 2))
  writeFile(`./${apps[i]}`,`./${apps[i]}/addDeps.json`,JSON.stringify(addDeps, null, 2))
}
function getVersion(version) {
  try {
    return version.split("_")[0];
  } catch (e) {
    return version;
  }
}

//先放monorepo的仓库，在放源仓库
function diffDepsForJson(newRep, oldRep) {
  const diff = {};
  const add = {};
  console.log('diffDepsForJson,length',newRep.length,'__',oldRep.length)
  newRep.forEach((dep) => {
    const findDep =  oldRep.find(item=>item.name === dep.name)
    if (!findDep) {
      //该依赖在新仓库里存在，在旧仓库的lock文件里没有
      add[dep.name] = dep.version;
    } else {
      const newVersion = getVersion(dep.version.version);
      const oldVersion = findDep.version;
      if (oldVersion !== newVersion) {
        //该依赖版本有不同
        diff[dep.name] = `${newVersion} to ${oldVersion}`;
      }
    }
  });
  return { diff, add };
}

//ymal对比
function diffDepsForYmal(a, b) {
  const diff = {};
  const add = {};
  a.forEach((dep) => {
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

function writeFile(dir,filePath,data){
  fs.mkdir(dir, { recursive: true }, (err) => {
    if (err) {
        return console.error('创建文件夹失败:', err);
    }

    // 写入文件
    fs.writeFile(filePath, data, (err) => {
        if (err) {
            return console.error('写入文件失败:', err);
        }
    });
});
}