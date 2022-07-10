const {spawn} = require('child_process');

module.exports = {

    loadDataAndCreateIndexes: async function (callback) {
        const log = await runPythonAsPromiseAndReturnJson('loadDataAndCreateIndexes.py',null , false)
        console.log(log)
        callback()
    },

    getUserById: async function(id){
        console.log(`getUserById called with id: ${id}`);
        return runPythonAsPromiseAndReturnJson('runQueries.py',['byId', id], true)
    },
    
    getUsersByAge: async function(age) {
        console.log(`getUsersByAge called with age: ${age}`);
        return runPythonAsPromiseAndReturnJson('runQueries.py',['byAge', age], true)
    },
    
    getUsersByCountry: async function(country) {
        console.log(`getUsersByCountry called with country: ${country}`);
        return runPythonAsPromiseAndReturnJson('runQueries.py',['byCountry', country], true)
    },
    
    getUsersByName: async function(name) {
        console.log(`searchUsersByName called with name: ${name}`);
        return runPythonAsPromiseAndReturnJson('runQueries.py',['byName', name], true)
    },
    
    deleteUser: async function(id) {
        console.log(`deleteUser called with id: ${id}`);
        return runPythonAsPromiseAndReturnJson('runQueries.py',['deleteById', id], true)
    }
}


const runPythonAsPromiseAndReturnJson = (scriptNane, arrayOfStringParams, isJson) => {

    return new Promise((resolve, reject)=>{

        const dataFromPython = []
        const scriptPath = './model/'+scriptNane
        const scriptParams =  arrayOfStringParams ? [scriptPath,...arrayOfStringParams] : [scriptPath]
        const pythonChildProccess = spawn('python3', scriptParams);
        
        pythonChildProccess.stdout.on('data', function (JsonDataAsBuffer) {
            try {
                const JsonDataAsString = JsonDataAsBuffer.toString()
                if (isJson) {
                    const JsonData = JSON.parse(JsonDataAsString)
                    dataFromPython.push(JsonData)  
                }else{
                    dataFromPython.push(JsonDataAsString)
                }
            } catch (error) {
                const errorMessage = "data from python script could not be parsed" + error
                reject(errorMessage)
            }
        })
        
        setComplitionListener(pythonChildProccess, resolve, dataFromPython)
        
        serErrorListener((pythonChildProccess, reject) )
    })
}

const setComplitionListener = (pythonChildProccess, resolve,dataFromPython ) => {
    pythonChildProccess.on('close', (any) => {
        console.log('script name '+ scriptNane + 'finis running successfuly')
        resolve(dataFromPython)
    })
}

const serErrorListener = (pythonChildProccess, reject) => {
    pythonChildProccess.on('error', (error) => {
        try {
            const errorAsString = error.toString()
            const errorMessage = "error has acured in python: "+ errorAsString
            reject(errorMessage)
        } catch (error) {
            const errorMessage = "error has acured in python script but could not be parsed to string"
            reject(errorMessage)
        }
    })
}

