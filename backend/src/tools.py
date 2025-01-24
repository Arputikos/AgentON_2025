from langgraph import Tool

search_tool = Tool(
    name="SearchTool",
    description="Search the internet for the latest information on a given topic.",
    function=lambda query: f"Performing a web search for: {query}"  # Mock function for demonstration
)

calculator_tool = Tool(
    name="CalculatorTool", 
    description="Solve mathematical expressions or perform calculations.",
    function=lambda state, expression: {
        "result": float(eval(expression)),
        "explanation": f"Calculated result of {expression}"
    }
)