// utils/order-config-helper.ts
import { BlockConfig, VariantOption } from '@/types/builder';
import { ProductData } from '@/app/actions/product';

export const generateOrderModalBlocks = (product: ProductData): BlockConfig[] => {
  if (!product) return [];

  // --- 1. INTELIGÊNCIA DE GRUPOS DINÂMICA ---
  // Mapeamos os campos do banco para estruturas genéricas de UI
  const groups: Record<string, VariantOption[]> = {
    color: [],
    model: [], // Grupo para o "Tipo"
    size: [],
  };

  const uniqueValues = {
    color: new Set<string>(),
    model: new Set<string>(),
    size: new Set<string>(),
  };

  // Varre todas as variações para encontrar quais opções existem
  product.variations.forEach(v => {
    if (v.color) uniqueValues.color.add(v.color.trim());
    if (v.size) uniqueValues.size.add(v.size.trim());
    
    // Mapeia tanto 'variation' (novo) quanto 'type' (antigo) para o grupo MODELO
    const typeVal = v.variation || v.type;
    if (typeVal) uniqueValues.model.add(typeVal.trim());
  });

  // --- CONSTRUÇÃO DAS OPÇÕES ---

  // 1. Cores
  groups.color = Array.from(uniqueValues.color).map(val => ({
    label: val,
    qtyAvailable: 1, // O controle real de qtd é feito no OrderContext
    type: 'color', // Chave usada no OrderContext para filtrar
    groupName: 'Cor'
  }));

  // 2. Tipos (Variação)
  groups.model = Array.from(uniqueValues.model).map(val => ({
    label: val,
    qtyAvailable: 1,
    type: 'model', // Chave usada no OrderContext
    groupName: 'Tipo / Variação'
  }));

  // 3. Tamanhos (Com ordenação personalizada)
  const sizeOrder = ['PP', 'P', 'M', 'G', 'GG', 'XG', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '44', '46', '48'];
  
  groups.size = Array.from(uniqueValues.size).map(val => ({
    label: val,
    qtyAvailable: 1,
    type: 'size', // Chave usada no OrderContext
    groupName: 'Tamanho'
  }));

  // Ordena os tamanhos logicamente
  groups.size.sort((a, b) => {
    const indexA = sizeOrder.indexOf(a.label.toUpperCase());
    const indexB = sizeOrder.indexOf(b.label.toUpperCase());
    
    // Se ambos estão na lista de ordem conhecida
    if (indexA !== -1 && indexB !== -1) return indexA - indexB;
    // Se apenas A está
    if (indexA !== -1) return -1;
    // Se apenas B está
    if (indexB !== -1) return 1;
    // Se nenhum está, ordem alfabética
    return a.label.localeCompare(b.label);
  });

  // --- 2. CONSTRUÇÃO DOS BLOCOS (LEGO) ---
  // Inicia com os blocos padrão (Header e Info do Produto)
  const blocks: BlockConfig[] = [
    {
      id: 'order_header',
      type: 'order-header',
      isVisible: true,
      data: { title: 'Detalhes do Pedido' },
      style: { bgColor: '#ffffff', textColor: '#000000' }
    },
    {
      id: 'order_info',
      type: 'order-product-info',
      isVisible: true,
      data: {
        productName: product.name,
        // Usa imagem principal ou a primeira da variação
        productImage: product.mainImage || (product.variations[0]?.images[0]),
        vendorName: 'Loja Oficial',
      },
      style: { bgColor: '#ffffff' }
    }
  ];

  // --- ADICIONA OS SELETORES DINAMICAMENTE ---
  // Ordem sugerida: Cor -> Tipo -> Tamanho

  if (groups.color.length > 0) {
    blocks.push({
      id: 'sel_colors',
      type: 'order-variant-selector',
      isVisible: true,
      data: { title: 'Selecione a Cor', variantOptions: groups.color },
      style: { bgColor: '#ffffff' }
    });
  }

  if (groups.model.length > 0) {
    blocks.push({
      id: 'sel_models',
      type: 'order-variant-selector',
      isVisible: true,
      data: { title: 'Selecione o Tipo', variantOptions: groups.model },
      style: { bgColor: '#ffffff' }
    });
  }

  if (groups.size.length > 0) {
    blocks.push({
      id: 'sel_sizes',
      type: 'order-variant-selector',
      isVisible: true,
      data: { title: 'Selecione o Tamanho', variantOptions: groups.size },
      style: { bgColor: '#ffffff' }
    });
  }

  // --- FOOTER (Resumo e Botão Confirmar) ---
  blocks.push({
    id: 'order_footer',
    type: 'order-summary-footer',
    isVisible: true,
    data: {},
    style: { bgColor: '#ffffff' }
  });

  return blocks;
};