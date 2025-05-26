export class MarketApiClient {
  private apiBaseUrl: string = "https://gifts2.tonnel.network/api";
  constructor() {}

  public async getUserListedGifts(userId: number): Promise<any> {
    try {
      const response = await fetch(
        `${this.apiBaseUrl}/pageGifts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            "page":1,
            "limit":30,
            "sort":"{\"message_post_time\":-1,\"gift_id\":-1}",
            "filter":`{\"seller\":${userId}}`,
          }),
        }
      );

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching user listed gifts:", error);
    }
  }
}