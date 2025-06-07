import httpx

from clients.summary_api_base import SummaryAPIBase


class CustomSummaryAPI(SummaryAPIBase):
    """
    Custom implementation of the summary API integration.
    """

    async def run(self, summary_text: str) -> str:
        """
        Call the summary API with the given prompt.
        """
        prompt = f"Summarize the following tasks:\n{summary_text}"

        url = "https://api.example.com/ai"
        headers = {
            "Authorization": "Bearer your_api_key_here",
            "Content-Type": "application/json"
        }
        payload = {"prompt": prompt, "max_tokens": 1000}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, headers=headers)
            response.raise_for_status()
            return response.json().get("response", "No response from AI")
