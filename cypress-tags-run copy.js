#!/usr/bin/env node
// cypress-tags-run.js
const { execSync } = require('child_process');

const env = process.env;
const TEST_PARAMETER = env.TEST_PARAMETER || '';
const CI_NODE_INDEX = env.CI_NODE_INDEX || '0';
const TESTS_SELECTION = env.TESTS_SELECTION || 'X';
const REGRESSION_VERSION = env.REGRESSION_VERSION || '0';
const USER_QA = env.USER_QA || 'XXX';
const webenv = env.WEBENV || 'qa';
const messagesOutput = `cucumber-messages-${CI_NODE_INDEX}.ndjson`;
const key = env.CYPRESS_KEY || 'd6bbe5a1-a724-489a-a071-3d53b3780709';

// Normalizar: decodificar %20 y similares
function decodeParam(s) {
    try { return decodeURIComponent(s); } catch { return s; }
}

const envObj = {
    tags: `(${TEST_PARAMETER}) and @express`,
    webenv: webenv,
    messagesOutput: messagesOutput
};


function extractTags(param) {
    const decoded = param //decodeParam(param);
    // Separar por OR (mayúscula/minúscula) y también por pipes u otros separadores comunes
    const parts = decoded.split(/\s+OR\s+|\s*\|\|\s*|\s*,\s*/i);
    return parts
        .map(p => p.trim())
        .filter(p => p.length > 0);
}

const products = extractTags(TEST_PARAMETER);
const productTags = products.join(',');

// Construir tags base (tal como en tu script original)
const baseTags = process.env.EXTRA_BASE_TAGS || `website-authentication-ui,express-qa, selection_${TESTS_SELECTION}, RG_${REGRESSION_VERSION}, exec_qa_${USER_QA}, owner_qa_CarmenSolano`;

// Concatenar, evitando comas dobles
const combinedTags = [baseTags, productTags].filter(Boolean).join(',');


// Ejecutar npm install y cypress run con las variables armadas
const envJson = JSON.stringify(envObj);
const cmd = `npx cypress run --env ${envJson} --tag "${combinedTags}" --record --key=${key}`;

console.log('Ejecutando:', cmd);
try {
    execSync(cmd, { stdio: 'inherit', env: process.env });
    process.exit(0);
} catch (err) {
    console.error('Fallo en ejecución:', err.message);
    process.exit(err.status || 1);
}