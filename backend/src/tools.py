from langchain_core.tools import Tool
from .debate.models import SearchQuery, SearchResult, WebContent
from .config import settings
from exa_py import Exa
from trafilatura import extract
import aiohttp
import logging

logger = logging.getLogger(__name__)

def search_function(query: str) -> str:
    return f"Performing a web search for: {query}"

def calculator_function(expression: str) -> dict:
    return {
        "result": float(eval(expression)),
        "explanation": f"Calculated result of {expression}"
    }

async def websearch(search_query: SearchQuery) -> list[WebContent]:
    """Execute web search using Exa API"""
    exa_client = Exa(api_key=settings.EXA_API_KEY)
    final_results = SearchResult(urls=[], query_id=search_query.query_id)
    for query in search_query.queries:
        results = SearchResult(urls=[], query_id=search_query.query_id)
        try:
            response = exa_client.search(query, num_results=5)
            if response.results:
                urls = [result.url for result in response.results]
                results = SearchResult(urls=urls, query_id=search_query.query_id)
        except Exception as e:
            logger.error(f"Error in websearch: {str(e)}")
        finally:
            final_results.urls.extend(results.urls)
    web_contents = []
    for url in final_results.urls:
        async with aiohttp.ClientSession() as session:
            try:
                async with session.get(url) as response:
                    html = await response.text()
                    content = extract(html)
                    if not content:
                        raise ValueError(f"No content extracted from {url}")
                    web_contents.append(WebContent(url=url, content=content))
            except Exception as e:
                    logger.error(f"Error parsing website {url}: {str(e)}")
                    raise
    return web_contents

search_tool = Tool(
    name="SearchTool",
    description="Search the internet for the latest information on a given topic.",
    func=websearch
)

calculator_tool = Tool(
    name="CalculatorTool", 
    description="Solve mathematical expressions or perform calculations.",
    func=calculator_function
)