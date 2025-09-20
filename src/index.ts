type PingParams<T> = T extends unknown[] ? T : T extends (...args: infer K) => unknown ? K : [T];
type PingHandler<T> = (...args: PingParams<T>) => unknown;

export class Ping<T = []> {
	public readonly connector: PingConnector<T>;

	public constructor(private event = new Instance('BindableEvent')) {
		this.connector = new PingConnector<T>(this.event);
	}

	/**
	 * Fire the ping and alert all connections.
	 *
	 * @param args The arguments to pass to any connections.
	 */
	public fire(...args: Parameters<PingHandler<T>>) {
		this.event.Fire(...args);
	}

	/**
	 * Spawns a new task that will fire the ping and alert all connections.
	 *
	 * @param args The arguments to pass to any connections.
	 */
	public fireAsync(...args: Parameters<PingHandler<T>>) {
		task.spawn(() => this.event.Fire(...args));
	}

	/**
	 * Connect to the ping, alias for {@link PingConnector.connect}.
	 *
	 * @param handler The handler to call when the ping is fired.
	 * @returns The connection object.
	 */
	public connect(handler: PingHandler<T>) {
		return this.connector.connect(handler);
	}

	/**
	 * Creates a connection that automatically disconnects after
	 * the ping is fired once.
	 *
	 * @param handler The handler to call when the ping is fired.
	 * @returns The connection object.
	 */
	public once(handler: PingHandler<T>) {
		let done = false;

		const conn = this.connector.connect((...args) => {
			if (done) return;

			done = true;
			conn.disconnect();

			handler(...args);
		});
	}

	/**
	 * Yields until the next time the ping is fired, then returns the result.
	 * Alias for {@link PingConnector.wait}.
	 */
	public wait() {
		return this.connector.wait();
	}

	/**
	 * Destroys the internal BindableEvent, disconnecting all connections.
	 */
	public destroy() {
		this.event.Destroy();
	}
}

export class PingConnector<T> {
	public constructor(private event: BindableEvent<PingHandler<T>>) {}

	/**
	 * Connect a callback to the ping that will get called
	 * whenever the ping is fired.
	 *
	 * @param handler The handler to call when the ping is fired.
	 * @returns The connection object.
	 */
	public connect(handler: PingHandler<T>) {
		const conn = this.event.Event.Connect(handler);
		return new PingConnection(conn);
	}

	/**
	 * (Parallel) Connect a callback to the ping that will get called
	 * whenever the ping is fired.
	 *
	 * @param handler The handler to call when the ping is fired.
	 * @returns The connection object.
	 */
	public connectParallel(handler: PingHandler<T>) {
		const conn = this.event.Event.ConnectParallel(handler);
		return new PingConnection(conn);
	}

	/**
	 * Yields until the next time the ping is fired, then returns the result.
	 *
	 * @returns The arguments passed when the ping was fired.
	 */
	public wait() {
		return this.event.Event.Wait()[0] as Parameters<PingHandler<T>>;
	}
}

export class PingConnection {
	public constructor(private connection: RBXScriptConnection) {}

	/**
	 * Disconnects the connection.
	 */
	public disconnect() {
		this.connection.Disconnect();
	}

	/**
	 * Disconnects the connection.
	 * Alias for {@link PingConnection.disconnect}.
	 */
	public destroy() {
		this.connection.Disconnect();
	}

	/**
	 * Returns whether the connection is connected.
	 */
	public isConnected() {
		return this.connection.Connected;
	}
}
