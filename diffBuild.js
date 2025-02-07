// 需要diff的项目列表 
const projects = ['build/agent','build/mcn'];

projects.forEach((project) => {
  // 1、输入：构建产物1、构建产物2
  const oldpackages = require(`./${project}/old.json`);
  const newpackages = require(`./${project}/new.json`);

  // 迁移前项目的依赖名
  const oldpackagesNames = [];
  // 迁移前项目的依赖->版本映射
  const oldpackagesVersion = {};
  // 迁移后项目的依赖名
  const newpackagesNames = [];
  // 迁移后项目的依赖->版本映射
  const newpackagesVersion = {};

  function formatPackageVersion(package) {
    return [package.name, package.instances[0].info.version];
  }

  oldpackages.forEach((package) => {
    const [packageName, version] = formatPackageVersion(package);
    oldpackagesNames.push(packageName);
    oldpackagesVersion[packageName] = version;
  });

  newpackages.forEach((package) => {
    const [packageName, version] = formatPackageVersion(package);
    newpackagesNames.push(packageName);
    newpackagesVersion[packageName] = version;
  });

  // 2、分析 && 输出：依赖变更
  oldpackagesNames.forEach((packageName) => {
    if (!newpackagesNames.includes(packageName)) {
      const oldpackage = `${packageName}@${oldpackagesVersion[packageName]}`;
      console.log(`新${project}工程缺少packageName:${oldpackage}`);
    }
    const newVersion = newpackagesVersion[packageName];
    if (newVersion && newVersion !== oldpackagesVersion[packageName]) {
      const oldpackage = `${packageName}@${oldpackagesVersion[packageName]}`;
      console.log(`新${project}工程版本不一致:${oldpackage}=>${newVersion}`);
    }
  });

})



