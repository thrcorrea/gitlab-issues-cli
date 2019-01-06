#!/usr/bin/env node
require('dotenv').config();
const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const shell = require("shelljs");
const { makeGitlabApi } = require('./gitlabApi');

let ApiInstance;

const init = async () => {
  console.log(
    chalk.green(
      figlet.textSync("Gitlab Issues", {
        font: "Standard",
        horizontalLayout: "default",
        verticalLayout: "default"
      })
    )
  );

  if (!process.env.ISSUES_API_TOKEN) {
    const { USER_TOKEN } = await inquirer.prompt([{ name: "USER_TOKEN", type: "input", message: "Deseja inserir seu token?" }]);
    process.env.ISSUES_API_TOKEN = USER_TOKEN;
  }

  ApiInstance = makeGitlabApi('https://git.4all.com', process.env.ISSUES_API_TOKEN);
}

const makeSelectiveQuestion = async (message, list, itemName) => {
  const { result } = await inquirer.prompt({
    type: "list",
    name: "result",
    message,
    choices: list.map((item) => item[itemName])
  });

  return list.filter((item) => item.name === result)[0].id;
}

const askQuestions = () => {
  const questions = [
    {
      name: "FILENAME",
      type: "input",
      message: "What is the name of the file without extension?"
    },
    {
      type: "list",
      name: "EXTENSION",
      message: "What is the file extension?",
      choices: [".rb", ".js", ".php", ".css"],
      filter: function (val) {
        return val.split(".")[1];
      }
    }
  ];
  return inquirer.prompt(questions);
};


const createFile = (filename, extension) => {
  const filePath = `${process.cwd()}/${filename}.${extension}`
  shell.touch(filePath);
  return filePath;
};

const success = (filepath) => {
  console.log(
    chalk.white.bgGreen.bold(`Done! File created at ${filepath}`)
  );
};

const run = async () => {
  await init();

  const groups = await ApiInstance.listGroups();

  const groupId = await makeSelectiveQuestion('Selecione o grupo', groups, 'name');

  const projects = await ApiInstance.listProjects(groupId);

  console.log(projects);

  const issues = await ApiInstance.listIssues(groupId);

  console.log(issues);

  // const answers = await askQuestions();
  // const { FILENAME, EXTENSION } = answers;

  // const filePath = createFile(FILENAME, EXTENSION);

  // success(filePath);
}

run();
