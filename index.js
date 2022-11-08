//modulo externo
const inquirer = require('inquirer')
const chalk = require('chalk')
//modulo interno
const fs = require('fs')
//criando a chamada para executar a função ao iniciar o sistema
const operations = operation()
//selecionando operações
function operation() {
    inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'O que você deseja fazer?',
            choices: ['Criar Conta', 'Depositar', 'Consultar Saldo', 'Sacar', 'Sair']
        },
    ])
        // é preciso chamar o then pois o sistema foi criado baseado numa promisse
        .then((answer) => {
            //para pegar a opção escolhida pelo usuario
            //aqui é possivel ao inves de usar if fazer um encadeamento de .then, no caso um pra casa opção ??
            const action = answer['action']
            if (action === 'Criar Conta') {
                createAccount()
            } else if (action === 'Depositar') {
                deposit()
            } else if (action === 'Consultar Saldo') {
                getAccountBalance()
            } else if (action === 'Sacar') {
                withdraw()
            } else if (action === 'Sair') {
                console.log(chalk.bgBlue.black('Ficamos agradecidos por usar nossos serviços, até mais!'))
                process.exit()
            }
        })
        .catch((err) => console.log(err))
}

//criando a opção de criação de conta
function createAccount() {
    console.log(chalk.bgYellowBright.whiteBright('Estamos felizes por escolhido o nosso Banco :)'))
    console.log(chalk.bgBlue.bold('Defina as Configurações da sua Conta a seguir:'))
    buildAccount()
}
function buildAccount() {
    //pegando dados do usuario para a criação da conta
    inquirer.prompt([
        {
            name: 'accountName',
            message: "Digite um nome para sua conta:",
        },
    ])
        .then((answer) => {
            const accountName = answer['accountName']
            //nome declarado para a conta criada
            //console.info(accountName)
            //as contas serão salvas num diretorio, quando este por sua vez nao existir, a instrução a baixo o criará!
            if (!fs.existsSync('accounts')) {
                fs.mkdirSync('accounts')
            }
            //fazer verificação se o nome da conta ja existe, se existir, nao seguir
            if (fs.existsSync(`accounts/${accountName}.json`)) {
                console.log(chalk.bgRed.black('Esta conta ja existe, escolha outro nome!'))
                //executando a instrução para escrever o nome para a conta
                buildAccount()
                return
            }
            //depois que a o nome da conta estiver setado o usuario devera ir direto para a tela de criar senha para conta
            inquirer.prompt([
                {
                    name: 'accountId',
                    message: 'Para maior segurança escolha uma senha com 4 digitos para sua conta:'
                },
            ])
                .then((answer) => {
                    const accountId = answer['accountId']
                    if (accountId.length != 4) {
                        console.log(chalk.bgRedBright.bold('Sua senha deve conter um total de QUATRO caracteres, tente Novamente!'))
                        inquirer.prompt([
                            {
                                name: 'accountId',
                                message: 'Para maior segurança escolha uma senha com 4 digitos para sua conta:'
                            },
                        ])
                            .then((answer) => {
                                const accountId = answer['accountId']
                                if (accountId.length != 4) {
                                    console.log(chalk.bgRedBright.bold('Sua senha deve conter um total de QUATRO caracteres, tente Novamente!'))
                                    return buildAccount()
                                } else {
                                    console.log(chalk.bgBlueBright.bold('Agora você está mais seguro, senha cadastrada com sucesso!'))
                                    fs.writeFileSync(`accounts/${accountName}.json`, `{"balance":0, "accountId":${accountId}}`, function (err) {
                                        console.log(err)
                                    },
                                        console.log(chalk.bgGray.bold.yellow(`Parabéns ${accountName}, agora você é nosso cliente!`))
                                    )
                                    operation()
                                }
                            })
                            .catch(err => console.log(err))
                    } else {
                        console.log(chalk.bgBlueBright.bold('Agora você está mais seguro, senha cadastrada com sucesso!'))
                        //escrevendo o nome de conta dentro do arquivo .json criado
                        fs.writeFileSync(`accounts/${accountName}.json`, `{"balance":0, "accountId":${accountId}}`, function (err) {
                            console.log(err)
                        },
                            console.log(chalk.bgGray.bold.yellow(`Parabéns ${accountName}, agora você é nosso cliente!`))
                        )
                        operation()
                    }
                })
                .catch(err => console.log(err))
        })
        .catch((err) => console.log(err))
}
//adicionando valor a conta do usuario
function deposit() {

    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Digite o nome da Conta para Depositar?'
        },
    ])
        .then((answer) => {
            //verificar se a conta existe
            const accountName = answer['accountName']
            if (!checkAccount(accountName)) {
                return deposit()
            }
            inquirer.prompt([
                {
                    name: 'amount',
                    message: 'Quanto você irá depositar?'
                },
            ])
                .then((answer) => {
                    const amount = answer['amount']

                    //adicionar saldo
                    addAmount(accountName, amount)
                    // return operation()
                })
                .catch(err => 
                    console.log(err))
        })
        .catch(err => console.log(err))
        
}

//função para verificar se a conta existe
function checkAccount(accountName) {
    if (!fs.existsSync(`accounts/${accountName}.json`)) {
        console.log(chalk.bgRed.bold.black('Esta conta não existe em nosso sistema, insira um nome de conta válida e tente novamente!'))
        return false
    }
    return true
}

function addAmount(accountName, amount) {
    const accountData = getAccount(accountName)

    //gerando um erro para quando nao é inserido valor de deposito
    if (!amount) {
        console.log(chalk.bgRed.bold.black('Ocorreu um erro ao depositar, verifique se o valor é válido!'))
        return deposit()
    }
    //o console.log mostrara o retorno da função getAccount, por tanto o JSON do arquivo selecionado pelo accountName
    //console.log(accountData)
    accountData.balance = parseFloat(amount) + parseFloat(accountData.balance)
    //para salvar o valor alterado dentro de 'banco de dados' json
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        //para transformar o json em texto
        JSON.stringify(accountData), function (err) {
            console.log(err)
        }
    )
    console.log(chalk.bgGreenBright.bold.black(`Foi depositado o valor R$${amount} na conta ${accountName}!`))
}
//função ler o nome do arquivo json e retornar a conta
function getAccount(accountName) {
    //para retornar o JSON do arquivo selecionado pelo nome
    const accountJSON = fs.readFileSync(`accounts/${accountName}.json`, {
        //padrao brasileiro onde é possivel prever acento
        encoding: 'utf8',
        //a flag 'r' indica que o arquivo apenas sera lido 
        flag: 'r'
    })
    //o JSON.parse transforma o accountJSON em json novamente
    return JSON.parse(accountJSON)
}
//função para ver saldo
function getAccountBalance() {
    inquirer.prompt([
        {
            name: 'accountName',
            message: 'Qual o nome da conta em que deseja consultar?'
        },
        
    ])
        .then((answer) => {
            const accountName = answer['accountName']
            //verificação se a conta existe
            if (!checkAccount(accountName)) {
                return getAccountBalance()
            }
            inquirer.prompt([
                {
                    name:'accountId',
                    message:'Para que seja concluir esta operação digite sua senha de 4 caracteres'
                }
            ])
            .then((answer) =>{
                const accountId = answer['accountId']
                const accountData = getAccount(accountName)
            
            if(accountId == accountData.accountId){
                console.log(chalk.bgBlue.black(`O saldo na conta de ${accountName} é de R$${accountData.balance}`))
            }else if(accountId != accountData.accountId){
                console.log(chalk.bgRed.bold('A senha informada está incorreta, verifique a conta que deseja consultar e a senha novamente!'))
                return getAccountBalance()
            }
            operation()
            })

            .catch(err => console.log(err))
        })
        .catch(err => console.log(err))

}
//descrevendo função para sacar dinheiro da conta
function withdraw(){
    inquirer.prompt([
        {
            name:'accountName',
            message:'Identifique o nome da Conta que deseja fazer o saque'
        },
    ])
    .then((answer) => {
        const accountName = answer['accountName']
        //identificando se a conta existe
        if(!checkAccount(accountName)){
            return withdraw()
        }
        inquirer.prompt([ 
            {
                name:'accountId',
                message:'Para que seja concluir esta operação digite sua senha de 4 caracteres'
            }
        ])
        .then((answer) => {
            const accountId = answer['accountId']
            const accountData = getAccount(accountName)
            if(accountId == accountData.accountId){
                //criar um nove inquirer para pegar o valor a ser sacado
                inquirer.prompt([
                    {
                        name:'amount',
                        message:'Qual valor você deseja sacar?'
                    }
                ])
                .then((answer) => {
                    const amount = answer['amount']
                    removeAmount(accountName, amount)
                    
                })
                .catch(err => console.log(err))
             }
            else if(accountId != accountData.accountId){
                console.log(chalk.bgRed.bold('A senha informada está incorreta, verifique a conta e senha novamente para que seja possivel efetuar o saque!'))
                return withdraw()
            }
            

        })
        
        .catch(err => console.log(err))
    })
    .catch(err => console.log(err))
    
}
//logica para retirada de valor
function removeAmount(accountName, amount){
    const accountData = getAccount(accountName)
    if(!amount){
        console.log(chalk.bgRed.bold('Digite um valor válido'))
        return withdraw()
    }
    if(accountData.balance < amount){
        console.log(chalk.bgRed.bold(`Saldo indisponivel. Saque máximo para esta conta é de: R$${accountData.balance} `))
        return withdraw()
    }
    accountData.balance = parseFloat(accountData.balance) - parseFloat(amount)
    console.log(chalk.bgGreen.bold(`Você efetuou um saque de R$${amount}, seu saldo é R$${accountData.balance}`))
    fs.writeFileSync(
        `accounts/${accountName}.json`,
        //para transformar o json em texto
        JSON.stringify(accountData), function (err) {
            console.log(err)
        }
    )
    operation()
}




//função para setar senha de usuario no cadastro 


// function buildAccountId(accountName, accountId) {
//     inquirer.prompt([
//         {
//             name: 'accountId',
//             message: 'Para maior segurança escolha uma senha com 4 digitos para sua conta'
//         },
//     ])
//         .then((answer) => {
//             const accountId = answer['accountId']

//             if (accountId.length != 4) {
//                 console.log(chalk.bgRedBright.bold('Sua senha deve conter um total de QUATRO caracteres, tente Novamente!'))
//                 inquirer.prompt([
//                     {
//                         name: 'accountId',
//                         message: 'Para maior segurança escolha uma senha com 4 digitos para sua conta'
//                     },
//                 ])
//                     .then((answerErr) => {
//                         const accountId = answerErr['accountId']
//                         if (accountId.length != 4) {
//                             console.log(chalk.bgRedBright.bold('Sua senha deve conter um total de QUATRO caracteres, tente Novamente!'))
//                         } else {
//                             console.log(chalk.bgBlueBright.bold('Agora você está mais seguro, senha cadastrada com sucesso!'))
//                         }
//                     })
//                     .catch(err => console.log(err))

//             } else {
//                 console.log(chalk.bgBlueBright.bold('Agora você está mais seguro, senha cadastrada com sucesso!'))
//             }
//         })
//         .catch(err => console.log(err))
// }

//a mesma função de cima um pouco mais funcional

// function buildAccountId() {
//     inquirer.prompt([
//         {
//             name: 'accountId',
//             message: 'Para maior segurança escolha uma senha com 4 digitos para sua conta'
//         },
//     ])
//         .then((answer) => {
//             const accountId = answer['accountId']

//             if (accountId.length != 4) {
//                 console.log(chalk.bgRedBright.bold('Sua senha deve conter um total de QUATRO caracteres, tente Novamente!'))
//                 buildAccountId()
//             } else {
//                 console.log(chalk.bgBlueBright.bold('Agora você está mais seguro, senha cadastrada com sucesso!'))
//             }
//         })
//         .catch(err => console.log(err))
// }
// buildAccountId()