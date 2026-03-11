const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')
const chalk = require('chalk')

async function checkAndApplyUpdates() {

    console.log(chalk.blue('🔎 Verificando atualizações...'))

    try {

        if (!fs.existsSync(path.join(__dirname, '.git'))) {
            console.log(chalk.yellow('⚠️ Repositório git não encontrado.'))
            return false
        }

        execSync('git fetch', { stdio: 'ignore' })

        const status = execSync('git status -uno').toString()

        if (status.includes('behind') || status.includes('pode ser atualizado')) {

            console.log(chalk.yellow('⬇️ Atualização encontrada. Atualizando...'))

            try {

                // salva dados do usuário
                execSync('git stash --include-untracked', { stdio: 'ignore' })

                // atualiza bot
                execSync('git pull origin main', { stdio: 'ignore' })

                // restaura dados
                execSync('git stash pop || true', { stdio: 'ignore' })

                // instala dependências se necessário
                execSync('npm install', { stdio: 'ignore' })

                console.log(chalk.green('✅ Bot atualizado com sucesso.'))

                return true

            } catch {

                console.log(chalk.red('⚠️ Erro ao atualizar. Aplicando atualização segura...'))

                execSync('git fetch origin main', { stdio: 'ignore' })
                execSync('git reset --hard origin/main', { stdio: 'ignore' })
                execSync('npm install', { stdio: 'ignore' })

                console.log(chalk.green('✅ Bot atualizado com sucesso.'))

                return true
            }

        } else {

            console.log(chalk.green('✔ Bot já está atualizado.'))
            return false

        }

    } catch (error) {

        console.log(chalk.red('❌ Falha ao verificar atualização.'))
        return false
    }
}

module.exports = { checkAndApplyUpdates }