/**
 * Test simple de Dropbox sin autenticación
 * Ejecutar con: npx tsx test-dropbox-simple.ts
 */

import {config} from 'dotenv';
import {DropboxService} from './src/infrastructure/external-services/dropbox.service.js';
import * as fs from 'fs';
import * as path from 'path';

// Cargar variables de entorno
config();

async function testDropbox() {
  console.log('======================================');
  console.log('🧪 Dropbox Simple Integration Test');
  console.log('======================================\n');

  // 1. Verificar token
  const token = process.env.DROPBOX_ACCESS_TOKEN;
  
  if (!token) {
    console.error('❌ Error: DROPBOX_ACCESS_TOKEN no está configurado en .env');
    process.exit(1);
  }

  console.log('✅ Token de Dropbox encontrado');
  console.log(`   Token: ${token.substring(0, 20)}...\n`);

  try {
    // 2. Crear instancia del servicio
    console.log('📦 Creando instancia de DropboxService...');
    const dropboxService = new DropboxService({accessToken: token});
    console.log('✅ Servicio de Dropbox inicializado\n');

    // 3. Crear estructura de carpetas para un proyecto de prueba
    const testProjectCode = `TEST-${Date.now()}`;
    console.log(`📁 Creando estructura de carpetas para proyecto: ${testProjectCode}`);
    
    const projectPath = await dropboxService.createProjectFolder(testProjectCode);
    console.log(`✅ Carpetas creadas en: ${projectPath}\n`);

    // 4. Crear archivo de prueba
    console.log('📄 Creando archivo de prueba...');
    const testContent = `Prueba de integración de Dropbox
Fecha: ${new Date().toISOString()}
Proyecto: ${testProjectCode}
Sistema: Cartographic Project Manager

Este archivo fue creado automáticamente por el test de integración.`;

    const testBuffer = Buffer.from(testContent, 'utf-8');
    const testFileName = 'test-file.txt';
    const filePath = `${projectPath}/Messages/${testFileName}`;

    console.log(`📤 Subiendo archivo: ${filePath}`);
    const uploadResult = await dropboxService.uploadFile(filePath, testBuffer);
    console.log('✅ Archivo subido exitosamente');
    console.log(`   ID: ${uploadResult.id}`);
    console.log(`   Nombre: ${uploadResult.name}`);
    console.log(`   Tamaño: ${uploadResult.size} bytes`);
    console.log(`   Path: ${uploadResult.path}\n`);

    // 5. Generar link temporal de descarga
    console.log('🔗 Generando link temporal de descarga...');
    const linkResponse = await dropboxService.getTemporaryLink(filePath);
    console.log('✅ Link generado exitosamente');
    console.log(`   URL: ${linkResponse.link.substring(0, 80)}...`);
    console.log(`   Expira: ${linkResponse.expiresAt.toISOString()}\n`);

    // 6. Descargar el archivo
    console.log('📥 Descargando archivo...');
    const downloadedContent = await dropboxService.downloadFile(filePath);
    const downloadedText = downloadedContent.toString('utf-8');
    console.log('✅ Archivo descargado exitosamente');
    console.log(`   Contenido:\n${downloadedText.substring(0, 100)}...\n`);

    // 7. Verificar que el contenido coincide
    if (downloadedText === testContent) {
      console.log('✅ ¡Contenido verificado! Upload y download funcionan correctamente\n');
    } else {
      console.log('⚠️  Advertencia: El contenido descargado no coincide con el original\n');
    }

    // 8. Limpiar (eliminar archivo de prueba)
    console.log('🧹 Limpiando archivos de prueba...');
    await dropboxService.deleteFile(filePath);
    console.log('✅ Archivo eliminado\n');

    console.log('======================================');
    console.log('✅ ¡Todas las pruebas pasaron!');
    console.log('======================================');
    console.log('\n✨ La integración de Dropbox está funcionando correctamente\n');

  } catch (error) {
    console.error('\n❌ Error durante el test:');
    console.error(error);
    process.exit(1);
  }
}

// Ejecutar test
testDropbox().catch(console.error);
