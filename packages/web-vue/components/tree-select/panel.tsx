import {
  computed,
  defineComponent,
  PropType,
  ref,
  toRefs,
  Slots,
  watch,
} from 'vue';
import Tree from '../tree';
import { TreeProps, TreeNodeKey } from '../tree/interface';
import { useScrollbar } from '../_hooks/use-scrollbar';
import { ScrollbarProps } from '../scrollbar';
import { Scrollbar } from '../index';
import { getPrefixCls } from '../_utils/global-config';
import { getRelativeRect } from '../_utils/dom';

export default defineComponent({
  name: 'TreeSelectPanel',
  components: {
    Tree,
  },
  props: {
    treeProps: {
      type: Object as PropType<Partial<TreeProps>>,
      default: () => ({}),
    },
    selectedKeys: {
      type: Array as PropType<TreeNodeKey[]>,
    },
    showCheckable: {
      type: Boolean,
    },
    treeSlots: {
      type: Object as PropType<Slots>,
      default: () => ({}),
    },
    scrollbar: {
      type: [Boolean, Object] as PropType<boolean | ScrollbarProps>,
      default: true,
    },
    panelVisible: {
      type: Boolean,
    },
  },
  emits: ['change'],
  setup(props, { emit }) {
    const { showCheckable, selectedKeys, treeProps, scrollbar } = toRefs(props);
    const { displayScrollbar, scrollbarProps } = useScrollbar(scrollbar);
    const prefixCls = getPrefixCls('tree-select');
    const refTree = ref();

    const computedTreeProps = computed(() => {
      return {
        ...treeProps.value,
        disableSelectActionOnly: true,
        checkedKeys: showCheckable.value ? selectedKeys.value : [],
        selectedKeys: showCheckable.value ? [] : selectedKeys.value,
      };
    });

    const onSelect = (newVal: TreeNodeKey[], e: Event) => {
      if (showCheckable.value) {
        refTree.value?.toggleCheck?.(newVal[0], e);
      } else {
        emit('change', newVal);
      }
    };

    const onCheck = (newVal: TreeNodeKey[]) => {
      emit('change', newVal);
    };

    const wrapperEleRef = ref();

    const scrollIntoView = (key: any) => {
      refTree.value?.scrollIntoView?.({ key, align: 'top' });
      let wrapperEle = wrapperEleRef.value;
      if (!wrapperEle) {
        return;
      }
      if (wrapperEle.containerRef) {
        wrapperEle = wrapperEle.containerRef;
      }
      if (wrapperEle.scrollHeight === wrapperEle.offsetHeight) {
        return;
      }
      const optionEle = wrapperEle.querySelector(
        `div[data-key="${key}"]`
      ) as HTMLElement;

      if (!optionEle) {
        return;
      }
      const optionRect = getRelativeRect(optionEle, wrapperEle);
      const wrapperScrollTop = wrapperEle.scrollTop;

      if (optionRect.top < 0) {
        wrapperEle.scrollTo(0, wrapperScrollTop + optionRect.top);
      } else if (optionRect.bottom < 0) {
        wrapperEle.scrollTo(0, wrapperScrollTop - optionRect.bottom);
      }
    };

    // Handling when the drop-down box is displayed/hide
    watch(
      () => props.panelVisible && !!wrapperEleRef.value,
      (visible) => {
        if (visible) {
          // get last value key
          const current = selectedKeys.value?.[selectedKeys.value.length - 1];
          if (current != null) {
            // Execute scrollIntoView after the pop-up animation ends, otherwise unnecessary scrolling will occur
            setTimeout(() => {
              scrollIntoView(current);
            }, 80);
          }
        }
      },
      { immediate: true, flush: 'post' }
    );

    const renderTree = () => {
      return (
        <Tree
          ref={refTree}
          {...computedTreeProps.value}
          // @ts-ignore
          onSelect={onSelect}
          onCheck={onCheck}
          v-slots={props.treeSlots}
        />
      );
    };

    return () => {
      if (displayScrollbar.value) {
        return (
          <Scrollbar
            ref={wrapperEleRef}
            class={`${prefixCls}-tree-wrapper`}
            {...scrollbarProps.value}
          >
            {renderTree()}
          </Scrollbar>
        );
      }
      return (
        <div ref={wrapperEleRef} class={`${prefixCls}-tree-wrapper`}>
          {renderTree()}
        </div>
      );
    };
  },
});
