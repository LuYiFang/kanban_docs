from abc import ABC, abstractmethod


class SummaryAPIBase(ABC):
    """
    Abstract base class for summary API integrations.
    """

    @abstractmethod
    async def run(self, summary_text: str) -> str:
        """
        Call the summary API with the given prompt.
        """
        pass
