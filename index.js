import fs from "fs";
import path, { dirname } from "path";

const unusedFolders = [
  ".git",
  ".github",
  "node_modules",
  "public",
  "src",
  "test",
];

const extractData = (lines) => {
  const obj = {};
  let found = 0;
  lines.forEach((line) => {
    if (line.indexOf("---") > -1) {
      found++;
    }

    if (found === 2) {
      return obj;
    }

    if (found > 0) {
      if (line.indexOf(":") > -1) {
        const [key, value] = line.split(":");
        obj[key?.trim()] = value?.trim();
      }
    }
  });

  return obj;
};

const parseMarkdown = (filePath) => {
  const file = fs.readFileSync(filePath, "utf8");
  const lines = file.split("\n");
  const title = lines[0].replace("#", "").trim();
  const obj = extractData(lines);
  const link = filePath;
  console.log(obj);
  return {
    ...obj,
    path: link,
  };
};

const parseFolders = (folderPath) => {
  console.log(folderPath);
  const folderpaths = {
    items: [],
    prefixes: [],
  };
  const files = fs.readdirSync(folderPath);
  files.forEach((file) => {
    const filePath = path.join(folderPath, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      if (unusedFolders.indexOf(file) === -1) {
        folderpaths.prefixes.push(parseFolders(filePath));
      }
    } else {
      if (file.indexOf(".md") > -1) {
        folderpaths.items.push(parseMarkdown(filePath));
      }
    }
  });

  return folderpaths;
};

const folderpaths = {
  path: "",
  name: "Resources",
  items: [],
  prefixes: [],
};

fs.readdirSync(dirname(""), { withFileTypes: true }).forEach((file) => {
  if (file.isDirectory() && !unusedFolders.includes(file.name)) {
    folderpaths.prefixes.push({
      path: `/${file.name}`,
      name: file.name,
      ...parseFolders(`${file.name}`),
    });
  } else if (file.name.indexOf(".md") > -1) {
    folderpaths.items.push(parseMarkdown(`${file.name}`));
  }
});

console.log(folderpaths);

fs.writeFile("./index.json", JSON.stringify(folderpaths), (err) => {
  if (err) throw err;
  console.log("The file has been saved!");
});
