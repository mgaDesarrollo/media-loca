import 'dotenv/config'
import { neon } from '@neondatabase/serverless'
import {
  getTaskNotes,
  createTaskNote,
  updateTaskNote,
  deleteTaskNote,
} from '../lib/db/queries'

async function testTasks() {
  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL no está configurada en .env')
    process.exit(1)
  }

  console.log('🧪 Iniciando test de persistencia de tareas en Neon...\n')

  try {
    const sql = neon(databaseUrl)
    
    // 1. Obtener un usuario de prueba
    const users = await sql`SELECT id, email FROM users LIMIT 1`
    if (users.length === 0) {
      console.error('❌ No se puede realizar el test: no hay usuarios en la tabla "users"')
      process.exit(1)
    }

    const testUser = users[0]
    console.log(`👤 Usuario de prueba seleccionado: ${testUser.email} (ID: ${testUser.id})`)

    // 2. Test: Crear nota de tarea
    console.log('\n🔵 Test 1: Crear nota de tarea...')
    const createdNote = await createTaskNote(testUser.id, 'Nota de Test', 'purple')
    console.log('   Note creado:', createdNote)

    if (createdNote && createdNote.title === 'Nota de Test' && createdNote.color === 'purple') {
      console.log('   ✅ Test 1: PASSED')
    } else {
      console.log('   ❌ Test 1: FAILED')
      process.exit(1)
    }

    // 3. Test: Obtener notas de tarea
    console.log('\n🔵 Test 2: Obtener notas del usuario...')
    const userNotes = await getTaskNotes(testUser.id)
    console.log(`   Notas encontradas: ${userNotes.length}`)
    const found = userNotes.find((n: any) => n.id === createdNote.id)

    if (found) {
      console.log('   ✅ Test 2: PASSED')
    } else {
      console.log('   ❌ Test 2: FAILED')
      process.exit(1)
    }

    // 4. Test: Actualizar nota de tarea (con items JSONB)
    console.log('\n🔵 Test 3: Actualizar nota y agregar items...')
    const mockItems = [
      { id: '1', text: 'Subtarea 1', completed: false },
      { id: '2', text: 'Subtarea 2', completed: true }
    ]
    const updatedNote = await updateTaskNote(createdNote.id, testUser.id, 'Nota de Test Modificada', mockItems, 'pink')
    console.log('   Nota actualizada:', updatedNote)

    if (
      updatedNote &&
      updatedNote.title === 'Nota de Test Modificada' &&
      updatedNote.color === 'pink' &&
      Array.isArray(updatedNote.items) &&
      updatedNote.items.length === 2 &&
      updatedNote.items[1].completed === true
    ) {
      console.log('   ✅ Test 3: PASSED')
    } else {
      console.log('   ❌ Test 3: FAILED')
      process.exit(1)
    }

    // 5. Test: Eliminar nota de tarea
    console.log('\n🔵 Test 4: Eliminar nota de tarea...')
    const deletedNote = await deleteTaskNote(createdNote.id, testUser.id)
    console.log('   Nota eliminada:', deletedNote)

    const finalNotes = await getTaskNotes(testUser.id)
    const isStillPresent = finalNotes.some((n: any) => n.id === createdNote.id)

    if (deletedNote && !isStillPresent) {
      console.log('   ✅ Test 4: PASSED')
    } else {
      console.log('   ❌ Test 4: FAILED')
      process.exit(1)
    }

    console.log('\n🎉 ¡Todos los tests de persistencia de tareas han finalizado con ÉXITO (PASSED)!')

  } catch (error) {
    console.error('❌ Error durante la ejecución del test:', error)
    process.exit(1)
  }
}

testTasks().catch((err) => {
  console.error(err)
  process.exit(1)
})
