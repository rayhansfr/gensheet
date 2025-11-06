const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Admin User
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gensheet.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@gensheet.com',
      password: hashedPassword,
      role: 'ADMIN',
      language: 'en',
      timezone: 'UTC',
    },
  })
  
  console.log('✅ Admin user created:', admin.email)

  // Create Sample Inspector
  const inspectorPassword = await bcrypt.hash('inspector123', 10)
  
  const inspector = await prisma.user.upsert({
    where: { email: 'inspector@gensheet.com' },
    update: {},
    create: {
      name: 'Inspector User',
      email: 'inspector@gensheet.com',
      password: inspectorPassword,
      role: 'INSPECTOR',
      language: 'en',
      timezone: 'UTC',
    },
  })
  
  console.log('✅ Inspector user created:', inspector.email)

  // Create Sample Checksheet
  const checksheet = await prisma.checksheet.create({
    data: {
      title: 'Daily Safety Inspection',
      description: 'Standard daily safety checksheet for warehouse operations',
      category: 'safety',
      industry: 'manufacturing',
      status: 'ACTIVE',
      creatorId: admin.id,
      checkpoints: {
        create: [
          {
            title: 'Emergency exits are clear and accessible',
            description: 'Verify all emergency exits are unobstructed',
            order: 0,
            fieldType: 'CHECKBOX',
            isRequired: true,
            section: 'Emergency Preparedness',
          },
          {
            title: 'Fire extinguisher inspection',
            description: 'Check pressure gauge and seal',
            order: 1,
            fieldType: 'DROPDOWN',
            isRequired: true,
            section: 'Emergency Preparedness',
            config: {
              options: ['OK', 'Needs Attention', 'Not OK']
            }
          },
          {
            title: 'Temperature reading',
            description: 'Record warehouse temperature',
            order: 2,
            fieldType: 'NUMBER',
            isRequired: true,
            section: 'Environmental',
            config: {
              min: -20,
              max: 50,
              unit: '°C'
            }
          },
          {
            title: 'Lighting condition photo',
            description: 'Take photo of lighting conditions',
            order: 3,
            fieldType: 'PHOTO',
            isRequired: false,
            section: 'Environmental',
          },
          {
            title: 'PPE compliance check',
            description: 'All workers wearing required PPE',
            order: 4,
            fieldType: 'CHECKBOX',
            isRequired: true,
            section: 'Personnel Safety',
          },
          {
            title: 'Additional notes',
            description: 'Any additional observations',
            order: 5,
            fieldType: 'TEXTAREA',
            isRequired: false,
            section: 'General',
          },
        ]
      }
    },
    include: {
      checkpoints: true,
    }
  })

  console.log('✅ Sample checksheet created:', checksheet.title)
  console.log(`   - ${checksheet.checkpoints.length} checkpoints`)

  console.log('\n🎉 Seed completed successfully!')
  console.log('\n📝 Login credentials:')
  console.log('   Admin:')
  console.log('   Email: admin@gensheet.com')
  console.log('   Password: admin123')
  console.log('\n   Inspector:')
  console.log('   Email: inspector@gensheet.com')
  console.log('   Password: inspector123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
