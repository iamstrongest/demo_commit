const { NodeSSH } = require("node-ssh");

const { deployConfig } = require("./config/deploy.js");
const path = require("path");
async function deploy() {
  const ssh = new NodeSSH();
  await ssh.connect(deployConfig);
  const localDir = path.resolve("."); // 当前目录
  const remoteDir = "/usr/local/test"; // 目标目录
  // 指定要排除的文件或目录
  const excludeFiles = ["node_modules", "public1", "config"]; // 可以根据需要修改
  // 检查目标目录是否存在，并在存在时删除
  try {
    const result = await ssh.execCommand(
      `if [ -d ${remoteDir} ]; then rm -rf ${remoteDir}; fi`
    );
    console.log(result.stdout); // 输出删除结果
    console.error(result.stderr); // 输出错误信息（如果有）
  } catch (error) {
    console.error(`Error while checking/deleting directory: ${error.message}`);
  }

  const result = await ssh.putDirectory(localDir, remoteDir, {
    recursive: true,
    // 定义文件过滤回调函数
    fileCallback: (itemPath) => {
      console.log(`itemPath--->`, itemPath);

      // 判断当前文件是否在排除列表中
      const itemName = path.basename(itemPath);
      const shouldInclude = !excludeFiles.includes(itemName);
      console.log(`Should include ${itemName}: ${shouldInclude}`);
      return shouldInclude;
    },
  });

  console.log(`Upload result: ${result ? "Success" : "Failed"}`);

  ssh.dispose();
}

deploy().catch((err) => {
  console.error(`Deployment error: ${err.message}`);
});
