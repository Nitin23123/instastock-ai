import { NextResponse } from 'next/server';

// This is a mock API route that the frontend will call to trigger the AI Agent
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { itemsToRestock } = body;

    // TODO: In Phase 3, this will communicate with the Swiggy MCP Server
    // 1. Search for items via Catalog MCP
    // 2. Build cart via Cart MCP
    
    console.log("AI Agent received restock request for:", itemsToRestock);

    // Mock successful response
    return NextResponse.json({ 
      success: true, 
      message: "Cart built successfully via MCP",
      cartId: "mock_cart_123",
      items: itemsToRestock
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to communicate with MCP" },
      { status: 500 }
    );
  }
}
