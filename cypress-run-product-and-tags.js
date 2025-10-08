#!/usr/bin/env node
// scripts/cypress-tags-run.js
const { execSync } = require('child_process');
const path = require('path');

const env = process.env;
const TEST_PARAMETER = env.TEST_PARAMETER || '';
const CI_NODE_INDEX = env.CI_NODE_INDEX || '0';
const webenv = env.WEBENV || 'qa';
const messagesOutput = `cucumber-messages-${CI_NODE_INDEX}.ndjson`;
const key = env.CYPRESS_KEY || 'd6bbe5a1-a724-489a-a071-3d53b3780709';
const TESTS_SELECTION = env.TESTS_SELECTION || 'X';
const REGRESSION_VERSION = env.REGRESSION_VERSION || '0';
const USER_QA = env.USER_QA || 'XXX';
const baseFolderName = path.basename(process.cwd());


// Construcción de product tags (si ya tienes combinedTags, mantenlo)
// Aquí asumo que ya definiste combinedTags previamente; si no, arma uno básico:
const baseTags = env.EXTRA_BASE_TAGS || `${baseFolderName},express-qa, selection_${TESTS_SELECTION}, RG_${REGRESSION_VERSION}, exec_qa_${USER_QA}, owner_qa_GiovanniMenjivar`;
function escapeTag(tag) {
    // Replace all commas with underscores and all '%20' with spaces
    return tag.replace(/,/g, '_').replace(/%20/g, ' ').replace(/@/g, '');
}

const products = TEST_PARAMETER
    ? TEST_PARAMETER.split(/\s+OR\s+/i).map(p => p.trim()).filter(Boolean)
    : [];
const products2 = products.map(escapeTag);
const productTags = products2.join(',');
const combinedTags = [baseTags, productTags].filter(Boolean).join(',');

// No decodificar TEST_PARAMETER: conservar %20 y comas si es necesario
const envObj = {
    tags: `(${TEST_PARAMETER}) and @express`,
    webenv,
    messagesOutput
};
// 1) Ejecutar npm install (se usa shell para npm install)
console.log('Ejecutando: npm install');
execSync('npm install', { stdio: 'inherit', env: process.env });

// 2) Ejecutar npx cypress run usando spawnSync para pasar argumentos sin interpretación del shell
// Escapar comillas dobles para que el shell las respete
const envJsonEscaped = JSON.stringify(envObj).replace(/"/g, '\\"');

// Construir el comando Cypress
const cmd = `npx cypress run --env "${envJsonEscaped}" --tag "${combinedTags}" --record --key=${key}`;

console.log('Ejecutando:', cmd);
try {
    execSync(cmd, { stdio: 'inherit', env: process.env, shell: true });
    process.exit(0);
} catch (err) {
    console.error('Fallo en ejecución:', err.message);
    process.exit(err.status || 1);
}