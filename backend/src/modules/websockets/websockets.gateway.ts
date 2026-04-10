import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server } from 'ws';
import { Logger } from '@nestjs/common';

/**
 * 深度节流批处理的订单簿推送
 * 按照文档中的降级策略实现
 */
class DepthThrottler {
  private pendingUpdates = new Map<string, any>();
  private flushInterval = 100; // 100ms批处理间隔
  private server: Server;

  constructor(server: Server) {
    this.server = server;
    this.start();
  }

  private start() {
    setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  public queueUpdate(channel: string, snapshot: any) {
    this.pendingUpdates.set(channel, snapshot);
  }

  private flush() {
    this.pendingUpdates.forEach((snapshot, channel) => {
      this.broadcast(channel, snapshot);
    });
    this.pendingUpdates.clear();
  }

  private broadcast(channel: string, data: any) {
    const message = JSON.stringify({
      type: 'depth_update',
      channel,
      data,
    });
    // 广播给所有订阅这个channel的连接
    this.server.clients.forEach((client: any) => {
      if (client.readyState === 1 && client.subscriptions?.has(channel)) {
        client.send(message);
      }
    });
  }
}

interface Client extends WebSocket {
  id: string;
  subscriptions: Set<string>;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  path: '/ws',
})
export class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(WebsocketsGateway.name);
  private depthThrottler: DepthThrottler;
  private connections: Map<string, Client> = new Map();

  onModuleInit() {
    this.depthThrottler = new DepthThrottler(this.server);
  }

  handleConnection(client: Client) {
    // 生成唯一client ID
    const clientId = Math.random().toString(36).substring(2, 15);
    client.id = clientId;
    client.subscriptions = new Set();
    this.connections.set(clientId, client);
    
    this.logger.log(`Client connected: ${clientId}, total: ${this.connections.size}`);
    
    // 立即发送欢迎消息
    client.send(JSON.stringify({
      type: 'connected',
      clientId,
    }));
  }

  handleDisconnect(client: Client) {
    if (client.id) {
      this.connections.delete(client.id);
    }
    this.logger.log(`Client disconnected: ${client.id}, total: ${this.connections.size}`);
  }

  /**
   * 订阅某个资产的深度数据
   */
  public subscribe(client: Client, channel: string) {
    client.subscriptions.add(channel);
    this.logger.debug(`Client ${client.id} subscribed to ${channel}`);
  }

  /**
   * 取消订阅
   */
  public unsubscribe(client: Client, channel: string) {
    client.subscriptions.delete(channel);
    this.logger.debug(`Client ${client.id} unsubscribed from ${channel}`);
  }

  /**
   * 推送深度更新（会被节流批处理）
   */
  public publishDepthUpdate(assetId: number, snapshot: any) {
    const channel = `depth:${assetId}`;
    this.depthThrottler.queueUpdate(channel, snapshot);
  }

  /**
   * 推送成交记录
   */
  public publishTrade(assetId: number, trade: any) {
    const channel = `trades:${assetId}`;
    const message = JSON.stringify({
      type: 'new_trade',
      channel,
      data: trade,
    });

    this.server.clients.forEach((client: any) => {
      if (client.readyState === 1 && client.subscriptions?.has(channel)) {
        client.send(message);
      }
    });
  }

  /**
   * 推送价格更新
   */
  public publishPrice(assetId: number, price: number) {
    const channel = `price:${assetId}`;
    const message = JSON.stringify({
      type: 'price_update',
      channel,
      data: { price },
    });

    this.server.clients.forEach((client: any) => {
      if (client.readyState === 1 && client.subscriptions?.has(channel)) {
        client.send(message);
      }
    });
  }
}
