import { useRef, useState } from 'react';
import { useAppStore } from '../stores/appStore';

const PRESET_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
];

/** 使用 canvas 将图片缩小到 maxSize 以内，返回 JPEG Blob */
function resizeImage(file: File, maxSize: number = 256): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > height) {
        if (width > maxSize) {
          height = Math.round(height * (maxSize / width));
          width = maxSize;
        }
      } else {
        if (height > maxSize) {
          width = Math.round(width * (maxSize / height));
          height = maxSize;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D context not available'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/jpeg',
        0.85
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Image load failed'));
    };
    img.src = objectUrl;
  });
}

export default function PersonForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState(PRESET_COLORS[0]);
  const [description, setDescription] = useState('');
  const [avatarType, setAvatarType] = useState<'color' | 'image'>('color');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addPerson = useAppStore((s) => s.addPerson);
  const loading = useAppStore((s) => s.loading);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setAvatarType('image');
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // 先创建人物（使用颜色作为默认头像）
    const newPerson = await addPerson({
      name: name.trim(),
      avatar: avatarType === 'color' ? avatar : undefined,
      description: description.trim() || undefined,
    });

    // 如果选择了图片，先 resize 再上传头像
    if (avatarType === 'image' && selectedFile && newPerson) {
      try {
        const resizedBlob = await resizeImage(selectedFile, 256);
        const resizedFile = new File([resizedBlob], selectedFile.name, {
          type: 'image/jpeg',
        });
        await useAppStore.getState().uploadAvatar(newPerson.id, resizedFile);
      } catch (err: any) {
        console.error('头像上传失败:', err);
        alert('头像上传失败: ' + (err.message || '未知错误'));
      }
    }

    // 清理预览 URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-slate-300 mb-1">姓名 *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white"
          placeholder="输入朋友姓名"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">头像</label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => setAvatarType('color')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              avatarType === 'color'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            颜色
          </button>
          <button
            type="button"
            onClick={() => setAvatarType('image')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              avatarType === 'image'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            本地图片
          </button>
        </div>

        {avatarType === 'color' ? (
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAvatar(c)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  avatar === c ? 'border-white scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white hover:bg-slate-700 transition-colors"
              >
                {selectedFile ? '更换图片' : '选择图片'}
              </button>
              {selectedFile && (
                <span className="text-xs text-slate-400 truncate max-w-[150px]">
                  {selectedFile.name}
                </span>
              )}
            </div>
            {previewUrl && (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-slate-600">
                <img
                  src={previewUrl}
                  alt="预览"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm text-slate-300 mb-1">简介</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:border-blue-500 text-white resize-none"
          rows={3}
          placeholder="简单描述一下这位朋友..."
        />
      </div>

      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg font-medium transition-colors"
        >
          {loading ? '保存中...' : '添加朋友'}
        </button>
        <button
          type="button"
          onClick={handleClose}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
}
