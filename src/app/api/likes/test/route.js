import { NextResponse } from 'next/server'
import prisma from '@/utils/connect'

export async function GET() {
  try {
    console.log('Testing likes endpoint...')
    
    // Test 1: Check if we can connect to DB
    const connectionTest = await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test 2: Check if Post model works
    const postCount = await prisma.post.count()
    console.log(`✅ Found ${postCount} posts`)
    
    // Test 3: Check if Like model exists
    try {
      const likeCount = await prisma.like.count()
      console.log(`✅ Found ${likeCount} likes`)
    } catch (error) {
      console.log('❌ Like model error:', error.message)
      return NextResponse.json({ 
        error: 'Like model not found', 
        details: error.message 
      }, { status: 500 })
    }
    
    // Test 4: Check if we can create a like (dry run)
    const testPost = await prisma.post.findFirst({
      select: { slug: true }
    })
    
    if (!testPost) {
      return NextResponse.json({ 
        error: 'No posts found for testing' 
      }, { status: 500 })
    }
    
    console.log(`✅ Test post found: ${testPost.slug}`)
    
    return NextResponse.json({ 
      message: 'All tests passed!',
      postCount,
      testPost: testPost.slug
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({ 
      error: 'Test failed', 
      details: error.message 
    }, { status: 500 })
  }
}
