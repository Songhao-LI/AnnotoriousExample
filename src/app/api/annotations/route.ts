import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    // 获取数据文件的路径
    const jsonDirectory = path.join(process.cwd(), 'data');
    // 读取 JSON 文件内容
    const fileContents = await fs.readFile(jsonDirectory + '/received_data.json', 'utf8');
    // 解析 JSON 数据
    const data = JSON.parse(fileContents);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('读取文件失败:', error);
    return NextResponse.json({ error: '读取数据失败' }, { status: 500 });
  }
} 