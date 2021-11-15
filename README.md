# Ping

Yet another super simple bindable event wrapper which uses ✨`camelCase`✨ and allows connection via a encapsulated `connector` or with the `connect` function.

## Example

A simple example, there isn't much to this library.

```ts
interface PlayerData {
	level: number;
}

class PlayerDataService {
	private ping = new Ping<(player: Player, data: PlayerData) => void>();
	public readonly onDataUpdated = this.ping.connector;

	public update(player: Player, data: PlayerData) {
		this.ping.fire(player, data);
	}
}

new PlayerDataService().onDataUpdated.connect((player, data) => {
	print(`Player data updated for ${player.Name}, new data: ${data}.`);
});
```
