import { h, defineComponent } from 'vue'

import { height, offset } from '../../utils/dom.js'
import frameDebounce from '../../utils/frame-debounce.js'
import { getScrollTarget } from '../../utils/scroll.js'
import { slot } from '../../utils/slot.js'
import { listenOpts } from '../../utils/event.js'

const { passive } = listenOpts

export default defineComponent({
  name: 'QParallax',

  props: {
    src: String,
    height: {
      type: Number,
      default: 500
    },
    speed: {
      type: Number,
      default: 1,
      validator: v => v >= 0 && v <= 1
    },

    scrollTarget: {
      default: void 0
    }
  },

  emits: [ 'scroll' ],

  data () {
    return {
      scrolling: false,
      percentScrolled: 0
    }
  },

  watch: {
    height () {
      this.working === true && this.__updatePos()
    },

    scrollTarget () {
      if (this.working === true) {
        this.__stop()
        this.__start()
      }
    }
  },

  methods: {
    __update (percentage) {
      this.percentScrolled = percentage
      // TODO vue3 - emit only if listener is attached
      this.$emit('scroll', percentage)
    },

    __updatePos () {
      let containerTop, containerHeight, containerBottom

      if (this.__scrollTarget === window) {
        containerTop = 0
        containerHeight = window.innerHeight
        containerBottom = containerHeight
      }
      else {
        containerTop = offset(this.__scrollTarget).top
        containerHeight = height(this.__scrollTarget)
        containerBottom = containerTop + containerHeight
      }

      const top = offset(this.$el).top
      const bottom = top + this.height

      if (this.observer !== void 0 || (bottom > containerTop && top < containerBottom)) {
        const percent = (containerBottom - top) / (this.height + containerHeight)
        this.__setPos((this.mediaHeight - this.height) * percent * this.speed)
        this.__update(percent)
      }
    },

    __setPos (offset) {
      // apply it immediately without any delay
      this.media.style.transform = `translate3D(-50%,${Math.round(offset)}px, 0)`
    },

    __onResize () {
      this.mediaHeight = this.media.naturalHeight || this.media.videoHeight || height(this.media)
      this.working === true && this.__updatePos()
    },

    __start () {
      this.working = true
      this.__scrollTarget = getScrollTarget(this.$el, this.scrollTarget)
      this.__scrollTarget.addEventListener('scroll', this.__updatePos, passive)
      window.addEventListener('resize', this.__resizeHandler, passive)
      this.__updatePos()
    },

    __stop () {
      if (this.working === true) {
        this.working = false
        this.__scrollTarget.removeEventListener('scroll', this.__updatePos, passive)
        window.removeEventListener('resize', this.__resizeHandler, passive)
        this.__scrollTarget = void 0
      }
    }
  },

  render () {
    return h('div', {
      class: 'q-parallax',
      style: { height: `${this.height}px` }
    }, [
      h('div', {
        ref: 'mediaParent',
        class: 'q-parallax__media absolute-full'
      }, this.$slots.media !== void 0 ? this.$slots.media() : [
        h('img', {
          ref: 'media',
          src: this.src
        })
      ]),

      h(
        'div',
        { class: 'q-parallax__content absolute-full column flex-center' },
        this.$slots.content !== void 0
          ? this.$slots.content({ percentScrolled: this.percentScrolled })
          : slot(this, 'default')
      )
    ])
  },

  mounted () {
    this.__setPos = frameDebounce(this.__setPos)
    this.__update = frameDebounce(this.__update)
    this.__resizeHandler = frameDebounce(this.__onResize)

    this.media = this.$slots.media !== void 0
      ? this.$refs.mediaParent.children[0]
      : this.$refs.media

    this.media.onload = this.media.onloadstart = this.media.loadedmetadata = this.__onResize
    this.__onResize()
    this.media.style.display = 'initial'

    if (window.IntersectionObserver !== void 0) {
      this.observer = new IntersectionObserver(entries => {
        this[entries[0].isIntersecting === true ? '__start' : '__stop']()
      })

      this.observer.observe(this.$el)
    }
    else {
      this.__start()
    }
  },

  beforeUnmount () {
    this.__stop()
    this.observer !== void 0 && this.observer.disconnect()
    this.media.onload = this.media.onloadstart = this.media.loadedmetadata = null
  }
})
