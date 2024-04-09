const electron = require('electron');
const url = require('url');
const path = require('path');
const fs = require('fs');
const fsExtra = require('fs-extra');
const { exec } = require('child_process');
const { rimraf } = require('rimraf');
const prompt = require('electron-prompt');
const ejs = require('ejs');
const Database = require('@bennettf/simpledb'); // My custom js json manipulation npm package

const {dialog, app, BrowserWindow, Menu, MenuItem, shell, ipcMain,  nativeTheme, BrowserView} = electron;

let currentProject = {folderPath: null, projectName: null, gameConfigPath: null, gameConfigData: null};
let projectLoaded = false;
let edtiorLoaded = false;
let mainWindow;
let mainMenu;

function waitForCondition(condition, timeBetweenChecks = 50){
    return new Promise((resolve, reject) => {
        let interval = setInterval(() => {
            if (typeof condition !== "function" && typeof condition !== "boolean"){
                console.error("Condition must be a function (function should also return a boolean) or a boolean value.");
                reject("Condition must be a function or a boolean value.");
            }

            else if (typeof condition === "boolean"){
                if (condition){
                    clearInterval(interval);
                    resolve();
                }
            }

            else if (typeof condition === "function"){
                if (condition()){
                    clearInterval(interval);
                    resolve();
                }
            }
            
        }, timeBetweenChecks);
    });
}


app.on('ready', function(){

    nativeTheme.themeSource = 'dark';


    mainWindow = new BrowserWindow({
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
          }
    });

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'editor/index.html'),
        protocol:'file:',
        slashes: true
    }));

    mainWindow.webContents.on('did-finish-load', () => {
        edtiorLoaded = true;
    });


    mainWindow.on('closed', () => {
        app.quit();
    })

   async function createNewProject(){
        const projectDir = await dialog.showOpenDialog(mainWindow, {
            properties: ['openDirectory']
        });

        const folderPath = projectDir.filePaths[0];
        const projectName = path.basename(folderPath);

        

        fsExtra.copy(path.join(__dirname, '/templates/projectTemplate'), folderPath, async (err) => {
            if (err) throw err;

          
            loadProject(folderPath);
        });



        
    }


    
    const mainMenuTemplate = [
        {
            label:'Save',
            async click(){
                await saveProject();
            },
            accelerator: 'Ctrl+S'
        },
        {
            label:'File',
            submenu:[
                {
                    label: 'New Project',
                    click(){
                        createNewProject();
                    }
                },
                {
                    label: 'Load Project',
                    async click(){
                        const projectDir = await dialog.showOpenDialog(mainWindow, {
                            properties: ['openDirectory']
                        });

                        loadProject(projectDir.filePaths[0]);
                    }
                },
                {
                    label: 'Quit',
                    click(){app.quit();}
                }
            ]
        },
        {
            label:'Start Game',
            async click(){
                if(projectLoaded){
                    saveProject().then(() => {
                        createGameWindow(currentProject);
                    });
                }

                else{
                    dialog.showErrorBox('Error', 'No project loaded');
                }
            }
        },
        {
            label:'Scene',
            submenu:[
                {
                    label: 'Create Scene',
                    click(){
                        createScene();
                    }
                },
                {
                    label: 'Open Scene',
                    submenu:[

                    ]
                },
                {
                    label: 'Delete Scene',
                    submenu:[

                    ]
                }
            ]
        },
        {
            label:'Objects',
            submenu:[
                {
                    label: 'Create Prefab',
                    click(){
                        createPrefab();
                    }
                },
                {
                    label: 'Open Prefab',
                    submenu:[

                    ]
                }
            ]
        },
        {
            label:'Scripting',
            submenu:[
                {
                    label: 'Create Script',
                    click(){
                        createScript();
                    }
                },
                {
                    label: 'Open A Script',
                    submenu:[
                        
                    ]
                }
            ]
        },
        {
            label:'Dev Tools',
            submenu:[
                {
                    label: 'Toggle Dev Tools',
                    click(item, focusedWindow){
                        focusedWindow.toggleDevTools();
                    }
                },
                {
                    role: 'reload'
                }
            ]
            
        }
    ];



    mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);

});

async function loadProject(pathToFolder){
    const projectName = path.basename(pathToFolder);
    const gameConfigPath = path.join(pathToFolder, 'gameConfig.json');
    const gameConfigData = await fs.promises.readFile(gameConfigPath, 'utf8');

    currentProject = {folderPath: pathToFolder, projectName: projectName, gameConfigPath: gameConfigPath, gameConfigData: gameConfigData};
    projectLoaded = true;

    waitForCondition(edtiorLoaded).then(() => {
        mainWindow.webContents.send('projectLoaded', currentProject);
        mainWindow.webContents.send('reloadGameConfig', gameConfigData);
    });

    //Add current scripts to menu
    const scriptsPath = path.join(pathToFolder, 'assets', 'scripts');
    const scripts = await fs.promises.readdir(scriptsPath);

    const scriptMenuItems = scripts.map((script) => {
        return new MenuItem({
            label: script,
            click(){
                exec(`code ${path.join(scriptsPath, script)}`);
            }
        });
    });

    clearSubMenu(mainMenu, 'Open A Script');
    clearSubMenu(mainMenu, 'Open Prefab');

    clearSubMenu(mainMenu, 'Open Scene');
    clearSubMenu(mainMenu, 'Delete Scene');

    for (let scene in JSON.parse(gameConfigData).scenes){
        MenuTools.addSceneToMenu(scene, mainMenu);

        MenuTools.addToSubMenu(mainMenu, 'Delete Scene', new MenuItem({
            label: scene,
            click(){
                const gameData = JSON.parse(gameConfigData);
                delete gameData.scenes[scene];
                fs.promises.writeFile(gameConfigPath, JSON.stringify(gameData), 'utf8');
                loadProject(pathToFolder);
            }
        }));
    }

    for (let scriptMenuItem of scriptMenuItems){
        MenuTools.addToSubMenu(mainMenu, 'Open A Script', scriptMenuItem);
    }

    console.log("Project Loaded: " + currentProject.projectName);
}


function createGameWindow(currentProjectObj){
    const gameWindow = new BrowserWindow({
        webPreferences: {
            preload: path.resolve(currentProjectObj.folderPath, 'preload.js')
        }
    });

    gameWindow.loadURL(url.format({
        pathname: path.resolve(currentProjectObj.folderPath, 'index.html'),
        protocol:'file:',
        slashes: true
    }));

    const gameMenuTemplate = [
        {
            label:"Quit",
            click(){gameWindow.close();}
        },
        {
            label:"Restart",
            click(){
                gameWindow.reload();
            },
            role: 'reload'
        },
        {
            label:"Open Dev Tools",
            click(){
                gameWindow.toggleDevTools();
            }
        }
    ];

    const gameMenu = Menu.buildFromTemplate(gameMenuTemplate);

    gameWindow.setMenu(gameMenu);
    
}

function requestGameData(mainWindow){
    return new Promise((resolve, reject) => {
        mainWindow.webContents.send('getGameData');
        ipcMain.on('gameData', (e, gameData) => {
            resolve(gameData);
        });
    });
}

async function saveProject(){
    if (!projectLoaded) {
        dialog.showErrorBox('Error', 'No project loaded');
        return;
    }
    
    const gameData = await requestGameData(mainWindow);
    const parsedData = JSON.parse(gameData);

    await fs.promises.writeFile(currentProject.gameConfigPath, JSON.stringify(parsedData), 'utf8');
    currentProject.gameConfigData = JSON.stringify(parsedData);
}

async function createScript(){
    if (!projectLoaded){
        dialog.showErrorBox('Error', 'No project loaded');
        return;
    }

    let scriptName = await prompt({
        title:'Script Name',
        label:'Enter a name for the js script.',
        value:'ExampleScript'
    });

    scriptName = scriptName.trim();
    scriptName = scriptName.replaceAll(' ', '');
    scriptName = scriptName[0].toUpperCase() + scriptName.slice(1);


    const destinationPath = path.join(currentProject.folderPath, 'assets', 'scripts')
    const sourceTemplatePath = path.join(__dirname, 'templates', 'scriptTemplate.ejs')  
    const templateContent = await fs.promises.readFile(sourceTemplatePath)

    const scriptPath = path.join(destinationPath, scriptName + '.js');
    const renderedTemplate = ejs.render(templateContent.toString(), {className: scriptName});
    fs.promises.writeFile(scriptPath, renderedTemplate, 'utf8');

    const scriptMenuItem = new MenuItem({
        label: scriptName,
        click(){
            exec(`code ${scriptPath}`);
        }
    });

    addToSubMenu(mainMenu, 'Open A Script', scriptMenuItem);
}

function addToSubMenu(menu, submenuLabel, menuItem) {
    function recursiveMenuSearch(parentMenu, itemLabelToFind){
        let foundMenu = null;

        for (item of parentMenu.items){
            if (item.label === itemLabelToFind){
                foundMenu = item;
                break;
            }

            else if (item.submenu){
                foundMenu = recursiveMenuSearch(item.submenu, itemLabelToFind);
                if (foundMenu) break;
            }
        }

        return foundMenu;
    }

    const foundMenu = recursiveMenuSearch(menu, submenuLabel);
    foundMenu.submenu.append(menuItem);
    
}

function clearSubMenu(menu, submenuLabel){
    function recursiveMenuSearch(parentMenu, itemLabelToFind){
        let foundMenu = null;

        for (item of parentMenu.items){
            if (item.label === itemLabelToFind){
                foundMenu = item;
                break;
            }

            else if (item.submenu){
                foundMenu = recursiveMenuSearch(item.submenu, itemLabelToFind);
                if (foundMenu) break;
            }
        }

        return foundMenu;
    }

    const foundMenu = recursiveMenuSearch(menu, submenuLabel);
    foundMenu.submenu.clear();

}

async function createPrefab(){
    if (!projectLoaded){
        dialog.showErrorBox('Error', 'No project loaded');
        return;
    }

    await saveProject();

    let prefabName = await prompt('Prefab Name', 'Enter a name for the prefab');
    prefabName = prefabName.trim();
    prefabName = prefabName.replaceAll(' ', '_');

    const prefabs = currentProject.gameConfigData.prefabs;
    prefabs[prefabName] = {
        name:prefabName,
        components:{}
    };

    await loadProject(currentProject.folderPath);
    
}

async function createScene(){
    if (!projectLoaded){
        dialog.showErrorBox('Error', 'No project loaded');
        return;
    }

    try{
        await saveProject();
    }
    catch(e){
        console.error(e);
    }

    let sceneName = await prompt('Scene Name', 'Enter a name for the scene');
    sceneName = sceneName.trim();
    sceneName = sceneName.replaceAll(' ', '_');

    const scenes = JSON.parse(currentProject.gameConfigData).scenes;
    scenes[sceneName] = {
        cameraConfig:{
            "startingPosition":{
                "x":0,
                "y":0
            },
            "defaultViewAmount":1920,
            "zoom":1,
            "willFollow":false,
            "followSettings":{
                "objectToFollow":"",
                "followSmoothness":0.1,
                "deadZone":{
                    "x":0,
                    "y":0
                }
            }
        },
        gameObjects:{

        }
    };

    const gameData = JSON.parse(currentProject.gameConfigData);
    gameData.scenes = scenes;
    currentProject.gameConfigData = JSON.stringify(gameData);
    await fs.promises.writeFile(currentProject.gameConfigPath, JSON.stringify(gameData), 'utf8');
    
    MenuTools.addSceneToMenu(sceneName, mainMenu);
    console.log("Scene Created: " + sceneName);
    console.log("path", currentProject.folderPath)
    await loadProject(currentProject.folderPath);

    // Temporary fix for race conditions 
    // Got stuck trying to fix the issue and am planning to come back to it
    setTimeout(async () => {
        await loadNewSceneInEditor(sceneName);
    }, 300);
}

async function loadNewSceneInEditor(sceneName){
    mainWindow.webContents.send('loadScene', sceneName);
}

class MenuTools{
    static addToSubMenu(menu, submenuLabel, menuItem) {
        function recursiveMenuSearch(parentMenu, itemLabelToFind){
            let foundMenu = null;
    
            for (item of parentMenu.items){
                if (item.label === itemLabelToFind){
                    foundMenu = item;
                    break;
                }
    
                else if (item.submenu){
                    foundMenu = recursiveMenuSearch(item.submenu, itemLabelToFind);
                    if (foundMenu) break;
                }
            }
    
            return foundMenu;
        }
    
        const foundMenu = recursiveMenuSearch(menu, submenuLabel);
        foundMenu.submenu.append(menuItem);
        
    }

    static clearSubMenu(menu, submenuLabel){
        function recursiveMenuSearch(parentMenu, itemLabelToFind){
            let foundMenu = null;
    
            for (item of parentMenu.items){
                if (item.label === itemLabelToFind){
                    foundMenu = item;
                    break;
                }
    
                else if (item.submenu){
                    foundMenu = recursiveMenuSearch(item.submenu, itemLabelToFind);
                    if (foundMenu) break;
                }
            }
    
            return foundMenu;
        }
    
        const foundMenu = recursiveMenuSearch(menu, submenuLabel);
        foundMenu.submenu.clear();
    
    }

    static addSceneToMenu(sceneName, menu){
        MenuTools.addToSubMenu(menu, 'Open Scene', new MenuItem({
            label: sceneName,
            click(){
                loadNewSceneInEditor(sceneName);
            }
        }));
    }
}

